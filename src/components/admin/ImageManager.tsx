'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImageOff, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteProductImageAction,
  setPrimaryProductImageAction,
  updateImagesOrder,
} from '@/lib/actions/product-image-actions';

export type ManagedProductImage = {
  id: string;
  url: string;
  publicId: string;
  displayOrder: number;
  isPrimary: boolean;
};

type ImageManagerProps = {
  productId: string;
  images: ManagedProductImage[];
};

function sortImages(images: ManagedProductImage[]) {
  return [...images].sort((left, right) => left.displayOrder - right.displayOrder);
}

function SortableImageCard({
  image,
  onDelete,
  onSetPrimary,
  isPending,
}: {
  image: ManagedProductImage;
  onDelete: (imageId: string) => void;
  onSetPrimary: (imageId: string) => void;
  isPending: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        'border border-[#2a2a2a] bg-[#0e0e0e] p-4 transition-colors',
        image.isPrimary ? 'border-l-2 border-l-white' : '',
        isDragging ? 'opacity-70' : 'hover:border-[#8e9192]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#2a2a2a] pb-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
            Image #{image.displayOrder + 1}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white">
            {image.isPrimary ? 'Primary Visual' : 'Secondary Visual'}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-12 min-w-12 items-center justify-center border border-[#2a2a2a] text-[#8e9192] transition-colors hover:border-white hover:text-white"
          aria-label="Drag image"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="relative mb-4 aspect-[4/3] overflow-hidden border border-[#2a2a2a] bg-[#121212]">
        <Image src={image.url} alt={image.publicId} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="truncate text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
          {image.publicId}
        </span>

        {image.isPrimary ? (
          <span className="inline-flex min-h-8 items-center bg-white px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black">
            Primary
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[#2a2a2a] pt-4">
        <button
          type="button"
          disabled={isPending || image.isPrimary}
          onClick={() => onSetPrimary(image.id)}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#2a2a2a] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          Ana Gorsel Yap
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => onDelete(image.id)}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#3b2929] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f0c2c2] transition-colors hover:border-[#f0c2c2] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Sil
        </button>
      </div>
    </article>
  );
}

export default function ImageManager({ productId, images }: ImageManagerProps) {
  const [orderedImages, setOrderedImages] = useState<ManagedProductImage[]>(() => sortImages(images));
  const [savedOrderIds, setSavedOrderIds] = useState<string[]>(() => sortImages(images).map((image) => image.id));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const nextImages = sortImages(images);
    setOrderedImages(nextImages);
    setSavedOrderIds(nextImages.map((image) => image.id));
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemIds = useMemo(() => orderedImages.map((image) => image.id), [orderedImages]);
  const hasOrderChanges = useMemo(() => {
    if (savedOrderIds.length !== itemIds.length) {
      return true;
    }

    return itemIds.some((id, index) => id !== savedOrderIds[index]);
  }, [itemIds, savedOrderIds]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedImages.findIndex((image) => image.id === active.id);
    const newIndex = orderedImages.findIndex((image) => image.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const nextImages = arrayMove(orderedImages, oldIndex, newIndex).map((image, index) => ({
      ...image,
      displayOrder: index,
    }));

    setOrderedImages(nextImages);
  }

  function handleApplyOrder() {
    startTransition(async () => {
      const result = await updateImagesOrder({
        productId,
        items: orderedImages.map((image, index) => ({ id: image.id, order: index })),
      });

      if (!result.success) {
        toast.error(result.message || 'Gorsel sirasi guncellenemedi.');
        return;
      }

      setOrderedImages((currentImages) =>
        currentImages.map((image, index) => ({
          ...image,
          displayOrder: index,
        }))
      );
      setSavedOrderIds(orderedImages.map((image) => image.id));
      toast.success(result.message || 'Gorsel sirasi guncellendi.');
    });
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      const previousImages = orderedImages;
      const nextImages = orderedImages
        .filter((image) => image.id !== imageId)
        .map((image, index) => ({
          ...image,
          displayOrder: index,
        }));

      if (previousImages.find((image) => image.id === imageId)?.isPrimary && nextImages[0]) {
        nextImages[0] = { ...nextImages[0], isPrimary: true };
      }

      setOrderedImages(nextImages);

      const result = await deleteProductImageAction({ productId, imageId });
      if (!result.success) {
        setOrderedImages(previousImages);
        toast.error(result.message || 'Gorsel silinemedi.');
        return;
      }

      setSavedOrderIds(nextImages.map((image) => image.id));
      toast.success(result.message || 'Gorsel silindi.');
    });
  }

  function handleSetPrimary(imageId: string) {
    startTransition(async () => {
      const previousImages = orderedImages;
      const nextImages = orderedImages.map((image) => ({
        ...image,
        isPrimary: image.id === imageId,
      }));

      setOrderedImages(nextImages);

      const result = await setPrimaryProductImageAction({ productId, imageId });
      if (!result.success) {
        setOrderedImages(previousImages);
        toast.error(result.message || 'Ana gorsel guncellenemedi.');
        return;
      }

      toast.success(result.message || 'Ana gorsel guncellendi.');
    });
  }

  if (orderedImages.length === 0) {
    return (
      <section className="border border-dashed border-[#2a2a2a] bg-[#0e0e0e] p-8">
        <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
          <div className="inline-flex min-h-12 min-w-12 items-center justify-center border border-[#2a2a2a] text-[#8e9192]">
            <ImageOff className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white">No product images</p>
            <p className="mt-2 text-sm text-[#8e9192]">Yeni yuklenen gorseller burada siralanabilir, silinebilir ve ana gorsel olarak atanabilir.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border border-[#2a2a2a] bg-[#131313] p-5 md:p-8">
      <div className="mb-8 flex flex-col gap-3 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[24px] font-medium text-white">Image Manager</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#8e9192]">
            Gorselleri surukleyip birakarak siralayin. Kart uzerinden silme ve ana gorsel atama islemlerini yonetin.
          </p>
        </div>

        <div className="inline-flex min-h-10 items-center border border-[#2a2a2a] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
          {orderedImages.length} Visuals
        </div>
      </div>

      <div className="mb-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleApplyOrder}
          disabled={isPending || !hasOrderChanges}
          className="inline-flex min-h-10 items-center justify-center border border-white bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Kaydediliyor...' : 'Siralamayi Uygula'}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orderedImages.map((image) => (
              <SortableImageCard
                key={image.id}
                image={image}
                onDelete={handleDelete}
                onSetPrimary={handleSetPrimary}
                isPending={isPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}