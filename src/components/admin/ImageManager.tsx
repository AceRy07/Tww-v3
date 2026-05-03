'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
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
import {
  AlertCircle,
  GripVertical,
  ImageOff,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteProductImageAction,
  mirrorUrlToCloudinaryAction,
  setPrimaryProductImageAction,
  updateImagesOrder,
  uploadProductImageAction,
} from '@/lib/actions/product-image-actions';

// --- Types -------------------------------------------------------------------

export type ManagedProductImage = {
  id: string;
  url: string;
  publicId: string;
  displayOrder: number;
  isPrimary: boolean;
};

type LocalImageStatus = 'uploading' | 'success' | 'error';

type LocalImage = {
  clientId: string;
  previewUrl: string;
  status: LocalImageStatus;
  error?: string;
  // populated on upload success
  serverId?: string;
  serverUrl?: string;
  serverPublicId?: string;
  displayOrder: number;
  isPrimary: boolean;
};

type ImageManagerProps = {
  productId: string;
  images: ManagedProductImage[];
  /** Called whenever there are in-flight uploads so parent can disable its save button */
  onPendingChange?: (hasPending: boolean) => void;
};

// --- Helpers -----------------------------------------------------------------

function toLocalImage(img: ManagedProductImage, index: number): LocalImage {
  return {
    clientId: img.id,
    previewUrl: img.url,
    status: 'success',
    serverId: img.id,
    serverUrl: img.url,
    serverPublicId: img.publicId,
    displayOrder: index,
    isPrimary: img.isPrimary,
  };
}

function sortByOrder<T extends { displayOrder: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => a.displayOrder - b.displayOrder);
}

// --- SortableImageCard -------------------------------------------------------

function SortableImageCard({
  image,
  isActionPending,
  onDelete,
  onSetPrimary,
  onRetry,
}: {
  image: LocalImage;
  isActionPending: boolean;
  onDelete: (clientId: string) => void;
  onSetPrimary: (clientId: string) => void;
  onRetry: (clientId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.clientId });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const isUploading = image.status === 'uploading';
  const isError = image.status === 'error';
  const isSuccess = image.status === 'success';

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        'border bg-[#0e0e0e] p-4 transition-colors',
        isError
          ? 'border-[#3b2929]'
          : image.isPrimary && isSuccess
            ? 'border-[#2a2a2a] border-l-2 border-l-white'
            : 'border-[#2a2a2a]',
        isDragging ? 'opacity-70' : isError ? '' : 'hover:border-[#8e9192]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#2a2a2a] pb-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
            Image #{image.displayOrder + 1}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.1em]">
            {isUploading ? (
              <span className="flex items-center gap-1 text-[#8e9192]">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Yukluyor...
              </span>
            ) : isError ? (
              <span className="flex items-center gap-1 text-[#f0c2c2]">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                Hata
              </span>
            ) : image.isPrimary ? (
              <span className="text-white">Ana Gorsel</span>
            ) : (
              <span className="text-[#8e9192]">Ikincil Gorsel</span>
            )}
          </p>
        </div>

        <button
          type="button"
          disabled={isUploading}
          className="inline-flex min-h-12 min-w-12 items-center justify-center border border-[#2a2a2a] text-[#8e9192] transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Gorseli surekle"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Preview */}
      <div className="relative mb-4 aspect-[4/3] overflow-hidden border border-[#2a2a2a] bg-[#121212]">
        {image.previewUrl ? (
          <>
            <Image
              src={image.previewUrl}
              alt={image.serverPublicId ?? 'onizleme'}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden="true" />
              </div>
            )}
            {isError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 px-2 text-center">
                <AlertCircle className="h-6 w-6 text-[#f0c2c2]" aria-hidden="true" />
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#f0c2c2]">
                  {image.error ?? 'Yukleme basarisiz'}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-[#444748]" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Public ID row */}
      {image.serverPublicId && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="block truncate text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
            {image.serverPublicId}
          </span>
          {image.isPrimary && (
            <span className="inline-flex min-h-8 shrink-0 items-center bg-white px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-black">
              Primary
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[#2a2a2a] pt-4">
        {isError ? (
          <button
            type="button"
            onClick={() => onRetry(image.clientId)}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#2a2a2a] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Yeniden Dene
          </button>
        ) : (
          <button
            type="button"
            disabled={isActionPending || isUploading || image.isPrimary || !isSuccess}
            onClick={() => onSetPrimary(image.clientId)}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#2a2a2a] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            Ana Gorsel Yap
          </button>
        )}

        <button
          type="button"
          disabled={isActionPending && isSuccess}
          onClick={() => onDelete(image.clientId)}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#3b2929] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f0c2c2] transition-colors hover:border-[#f0c2c2] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Sil
        </button>
      </div>
    </article>
  );
}

// --- Main Component ----------------------------------------------------------

export default function ImageManager({ productId, images: initialImages, onPendingChange }: ImageManagerProps) {
  const [localImages, setLocalImages] = useState<LocalImage[]>(() =>
    sortByOrder(initialImages).map((img, i) => toLocalImage(img, i))
  );

  /** Server IDs in their last-persisted display order */
  const [savedOrderIds, setSavedOrderIds] = useState<string[]>(() =>
    sortByOrder(initialImages).map((img) => img.id)
  );

  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isOrderPending, startOrderTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();

  /**
   * clientIds that the user deleted while the upload was still in flight.
   * After upload completes we clean up the newly created DB record.
   */
  const removedClientIdsRef = useRef(new Set<string>());

  /** Original upload sources keyed by clientId - needed for retry */
  const uploadSourcesRef = useRef(new Map<string, File | string>());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync when parent re-provides images (page navigation / server refresh)
  useEffect(() => {
    const sorted = sortByOrder(initialImages);
    setLocalImages(sorted.map((img, i) => toLocalImage(img, i)));
    setSavedOrderIds(sorted.map((img) => img.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages]);

  // -- Derived state ----------------------------------------------------------

  const hasUploading = localImages.some((img) => img.status === 'uploading');
  const uploadingCount = localImages.filter((img) => img.status === 'uploading').length;

  const hasOrderChanges = useMemo(() => {
    const currentOrder = localImages
      .filter((img) => img.serverId)
      .map((img) => img.serverId!);
    if (savedOrderIds.length !== currentOrder.length) return true;
    return currentOrder.some((id, i) => id !== savedOrderIds[i]);
  }, [localImages, savedOrderIds]);

  const showBar = hasUploading || hasOrderChanges;
  const canPublish = !hasUploading && hasOrderChanges;

  // Notify parent so it can disable its own save button
  useEffect(() => {
    onPendingChange?.(hasUploading);
  }, [hasUploading, onPendingChange]);

  // -- DnD --------------------------------------------------------------------

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const itemIds = useMemo(() => localImages.map((img) => img.clientId), [localImages]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localImages.findIndex((img) => img.clientId === active.id);
    const newIndex = localImages.findIndex((img) => img.clientId === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setLocalImages((prev) =>
      arrayMove(prev, oldIndex, newIndex).map((img, i) => ({ ...img, displayOrder: i }))
    );
  }

  // -- Upload engine ----------------------------------------------------------

  function runUpload(clientId: string, source: File | string) {
    uploadSourcesRef.current.set(clientId, source);

    const action =
      typeof source === 'string'
        ? () => mirrorUrlToCloudinaryAction({ productId, url: source })
        : () => uploadProductImageAction({ productId, source });

    action().then((result) => {
      // User deleted this item while it was uploading - clean up any orphan record
      if (removedClientIdsRef.current.has(clientId)) {
        removedClientIdsRef.current.delete(clientId);
        if (result.success) {
          deleteProductImageAction({ productId, imageId: result.data.id }).catch(console.error);
        }
        return;
      }

      if (result.success) {
        setLocalImages((prev) => {
          const target = prev.find((img) => img.clientId === clientId);
          if (target?.previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(target.previewUrl);
          }
          return prev.map((img) =>
            img.clientId === clientId
              ? {
                  ...img,
                  status: 'success' as const,
                  previewUrl: result.data.url,
                  serverId: result.data.id,
                  serverUrl: result.data.url,
                  serverPublicId: result.data.publicId,
                  isPrimary: result.data.isPrimary,
                }
              : img
          );
        });
        setSavedOrderIds((prev) => [...prev, result.data.id]);
        uploadSourcesRef.current.delete(clientId);
      } else {
        setLocalImages((prev) =>
          prev.map((img) =>
            img.clientId === clientId
              ? { ...img, status: 'error' as const, error: result.message }
              : img
          )
        );
        toast.error(result.message ?? 'Gorsel yuklenemedi.');
      }
    });
  }

  // -- File / URL handlers ----------------------------------------------------

  function handleFilesAdded(files: FileList | File[]) {
    const MAX_SIZE_MB = 1;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const validFiles: File[] = [];

    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) {
        toast.error(`"${f.name}" gecersiz dosya formati.`);
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        toast.error(`"${f.name}" ${MAX_SIZE_MB}MB sinirini asiyor.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    const baseOrder = localImages.length;
    const newItems: LocalImage[] = validFiles.map((_, i) => ({
      clientId: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(validFiles[i]),
      status: 'uploading' as const,
      displayOrder: baseOrder + i,
      isPrimary: baseOrder === 0 && i === 0,
    }));

    setLocalImages((prev) => [...prev, ...newItems]);

    for (let i = 0; i < validFiles.length; i++) {
      runUpload(newItems[i].clientId, validFiles[i]);
    }
  }

  function handleUrlAdd() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      toast.error('Gecerli bir URL girin.');
      return;
    }

    const newItem: LocalImage = {
      clientId: crypto.randomUUID(),
      previewUrl: trimmed,
      status: 'uploading' as const,
      displayOrder: localImages.length,
      isPrimary: localImages.length === 0,
    };

    setLocalImages((prev) => [...prev, newItem]);
    setUrlInput('');
    runUpload(newItem.clientId, trimmed);
  }

  function handleRetry(clientId: string) {
    const source = uploadSourcesRef.current.get(clientId);
    if (!source) {
      toast.error('Kaynak bilgisi bulunamadi, lutfen gorseli tekrar ekleyin.');
      return;
    }
    setLocalImages((prev) =>
      prev.map((img) =>
        img.clientId === clientId
          ? { ...img, status: 'uploading' as const, error: undefined }
          : img
      )
    );
    runUpload(clientId, source);
  }

  function handleDelete(clientId: string) {
    const image = localImages.find((img) => img.clientId === clientId);
    if (!image) return;

    if (image.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(image.previewUrl);
    }

    // Optimistically remove from UI immediately
    setLocalImages((prev) =>
      prev
        .filter((img) => img.clientId !== clientId)
        .map((img, i) => ({ ...img, displayOrder: i }))
    );

    if (image.status === 'uploading') {
      // Mark for post-upload cleanup
      removedClientIdsRef.current.add(clientId);
      return;
    }

    if (!image.serverId) {
      // Error state with no server record - nothing to clean up in DB
      return;
    }

    startActionTransition(async () => {
      const result = await deleteProductImageAction({ productId, imageId: image.serverId! });
      if (!result.success) {
        // Restore on failure
        setLocalImages((prev) => {
          const restored: LocalImage = { ...image, displayOrder: prev.length };
          return [...prev, restored].map((img, i) => ({ ...img, displayOrder: i }));
        });
        toast.error(result.message ?? 'Gorsel silinemedi.');
        return;
      }
      setSavedOrderIds((prev) => prev.filter((id) => id !== image.serverId));
      toast.success('Gorsel silindi.');
    });
  }

  function handleSetPrimary(clientId: string) {
    const image = localImages.find((img) => img.clientId === clientId);
    if (!image?.serverId) return;

    const snapshot = localImages;
    let newItems: LocalImage[] = [];

    setLocalImages((prev) => {
      const idx = prev.findIndex((img) => img.clientId === clientId);
      if (idx === -1) return prev;
      
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item); // Basa tasi

      newItems = next.map((img, i) => ({
        ...img,
        isPrimary: img.clientId === clientId,
        displayOrder: i,
      }));
      return newItems;
    });

    startActionTransition(async () => {
      // 1. Backend'de primary set et
      const resultPrimary = await setPrimaryProductImageAction({ productId, imageId: image.serverId! });
      if (!resultPrimary.success) {
        setLocalImages(snapshot);
        toast.error(resultPrimary.message ?? 'Ana gorsel guncellenemedi.');
        return;
      }
      
      // 2. Backend'de siralama set et (ana gorsel basa gelsin)
      const successImages = newItems.filter((img) => img.serverId);
      if (successImages.length > 0) {
        const orderResult = await updateImagesOrder({
          productId,
          items: successImages.map((img, i) => ({ id: img.serverId!, order: i })),
        });
        
        if (!orderResult.success) {
          toast.warning('Ana gorsel secildi ancak siralama kaydedilemedi.');
        } else {
          toast.success('Ana gorsel olarak atandi ve basa alindi.');
          setSavedOrderIds(successImages.map((img) => img.serverId!));
        }
      } else {
        toast.success('Ana gorsel guncellendi.');
      }
    });
  }

  function handlePublishOrder() {
    const successImages = localImages.filter((img) => img.serverId);
    if (successImages.length === 0) return;

    startOrderTransition(async () => {
      const result = await updateImagesOrder({
        productId,
        items: successImages.map((img, i) => ({ id: img.serverId!, order: i })),
      });

      if (!result.success) {
        toast.error(result.message ?? 'Siralama kaydedilemedi.');
        return;
      }

      setSavedOrderIds(successImages.map((img) => img.serverId!));
      toast.success('Degisiklikler yayinlandi.');
    });
  }

  // -- File drag zone handlers ------------------------------------------------

  function handleZoneDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleZoneDragLeave() {
    setIsDragOver(false);
  }

  function handleZoneDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  }

  // -- Render -----------------------------------------------------------------

  return (
    <section>
      {/* Sticky Action Bar */}
      {showBar && (
        <div
          className="sticky top-0 z-40 mb-6 border border-[#2a2a2a] bg-[#0e0e0e]/95 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              {hasUploading && (
                <Loader2 className="h-4 w-4 animate-spin text-[#8e9192]" aria-hidden="true" />
              )}
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3]">
                {hasUploading
                  ? `${uploadingCount} gorsel yukleniyor...`
                  : 'Siralama degisti - yayinlamak icin onaylayin'}
              </p>
            </div>

            <button
              type="button"
              disabled={!canPublish || isOrderPending}
              onClick={handlePublishOrder}
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-white bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isOrderPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  Degisiklikleri Yayinla
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Manager Panel */}
      <div className="border border-[#2a2a2a] bg-[#131313] p-5 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[24px] font-medium text-white">Image Manager</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#8e9192]">
              Gorselleri surekleyip birakarak siralayin. Yukleme arka planda devam ederken siralama
              ve silme islemleri yapabilirsiniz.
            </p>
          </div>
          <div className="inline-flex min-h-10 items-center border border-[#2a2a2a] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
            {localImages.length} Visuals
          </div>
        </div>

        {/* Add Zone */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* File drop zone */}
          <div
            onDragOver={handleZoneDragOver}
            onDragLeave={handleZoneDragLeave}
            onDrop={handleZoneDrop}
            className={[
              'flex flex-col items-center justify-center gap-4 border border-dashed p-8 transition-colors',
              isDragOver ? 'border-white bg-white/5' : 'border-[#444748] hover:border-[#8e9192]',
            ].join(' ')}
          >
            <div className="inline-flex min-h-12 min-w-12 items-center justify-center border border-[#2a2a2a] text-[#8e9192]">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3]">
                Dosya Surekle &amp; Birak
              </p>
              <p className="mt-1 text-[11px] text-[#8e9192]">veya asagidaki butonu kullanin</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-10 items-center gap-2 border border-[#2a2a2a] px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Dosya Sec
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFilesAdded(e.target.files);
                  e.target.value = '';
                }
              }}
            />
          </div>

          {/* URL input zone */}
          <div className="flex flex-col justify-center gap-4 border border-dashed border-[#444748] p-8 transition-colors hover:border-[#8e9192]">
            <div className="inline-flex min-h-12 min-w-12 items-center justify-center border border-[#2a2a2a] text-[#8e9192]">
              <Link2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3]">
                URL ile Ekle
              </p>
              <p className="mt-1 text-[11px] text-[#8e9192]">
                Gorsel URL sunucu tarafinda mirror alinarak Cloudinary ye yuklenir
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlAdd();
                  }
                }}
                placeholder="https://example.com/gorsel.jpg"
                className="min-h-10 flex-1 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white placeholder:text-[#444748] focus:border-[#8e9192] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUrlAdd}
                aria-label="URL ekle"
                className="inline-flex min-h-10 min-w-10 items-center justify-center border border-[#2a2a2a] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        {localImages.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-4 border border-dashed border-[#2a2a2a] text-center">
            <ImageOff className="h-8 w-8 text-[#444748]" aria-hidden="true" />
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              Henuz gorsel eklenmedi
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={itemIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {localImages.map((image) => (
                  <SortableImageCard
                    key={image.clientId}
                    image={image}
                    isActionPending={isActionPending}
                    onDelete={handleDelete}
                    onSetPrimary={handleSetPrimary}
                    onRetry={handleRetry}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  );
}





