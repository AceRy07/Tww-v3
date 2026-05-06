'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
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
  GripVertical,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  bulkUpdateCategoryStatusAction,
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryNameAction,
  updateCategorySortOrderAction,
  updateCategoryStatusAction,
} from '@/lib/actions/category-actions';
import {
  bulkUpdateColorStatusAction,
  createColorAction,
  deleteColorAction,
  updateColorNameAction,
  updateColorSortOrderAction,
  updateColorStatusAction,
} from '@/lib/actions/color-actions';

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

type ColorItem = {
  id: string;
  name: string;
  hex: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

type TabKey = 'categories' | 'colors';

type ModalState =
  | {
      open: false;
      mode: 'create' | 'edit';
      tab: TabKey;
      id?: string;
      slug?: string;
      currentHex?: string;
    }
  | {
      open: true;
      mode: 'create' | 'edit';
      tab: TabKey;
      id?: string;
      slug?: string;
      currentHex?: string;
    };

type DeleteConfirmState = {
  open: boolean;
  tab: TabKey;
  id: string;
  usageCount: number;
  label: string;
};

type Props = {
  initialCategories: CategoryItem[];
  initialColors: ColorItem[];
};

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function SortableFilterRow({
  id,
  name,
  slug,
  isActive,
  hex,
  selected,
  tab,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  hex?: string;
  selected: boolean;
  tab: TabKey;
  onToggleSelect: (id: string, checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: (id: string, nextStatus: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={[
        'grid grid-cols-[40px_44px_minmax(0,1fr)_120px_auto] items-center gap-3 border-b border-[#2a2a2a] px-3 py-3',
        isDragging ? 'bg-[#1a1a1a] opacity-70' : 'hover:bg-[#171717]',
      ].join(' ')}
    >
      <label className="flex min-h-10 items-center justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onToggleSelect(id, event.target.checked)}
          className="h-4 w-4 border border-[#3a3a3a] bg-transparent"
          aria-label={`Select ${name}`}
        />
      </label>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="inline-flex min-h-10 min-w-10 items-center justify-center border border-[#2a2a2a] text-[#8e8e8e] transition-colors hover:border-white hover:text-white"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {tab === 'colors' && hex ? (
            <span
              className="inline-block h-3 w-3 rounded-full border border-[#8e8e8e]"
              style={{ backgroundColor: hex }}
              aria-label={`Color swatch ${hex}`}
            />
          ) : null}
          <p className="truncate text-sm font-medium text-white">{name}</p>
        </div>
        <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8e8e8e]">
          {slug}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onToggleStatus(id, !isActive)}
        className={[
          'inline-flex min-h-8 items-center justify-center border px-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors',
          isActive
            ? 'border-[#1f4f2f] bg-[#102117] text-[#86efac] hover:border-[#86efac]'
            : 'border-[#3b2929] bg-[#261414] text-[#f0c2c2] hover:border-[#f0c2c2]',
        ].join(' ')}
      >
        {isActive ? 'Active' : 'Passive'}
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-9 items-center justify-center border border-[#2a2a2a] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
        >
          <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex min-h-9 items-center justify-center border border-[#3b2929] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f0c2c2] transition-colors hover:border-[#f0c2c2] hover:text-white"
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  );
}

export default function SettingsFiltersClient({ initialCategories, initialColors }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [categories, setCategories] = useState<CategoryItem[]>(() =>
    [...initialCategories].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [colors, setColors] = useState<ColorItem[]>(() =>
    [...initialColors].sort((a, b) => a.sortOrder - b.sortOrder)
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: 'create',
    tab: 'categories',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [hexInput, setHexInput] = useState('#000000');

  const [isSaving, startSaving] = useTransition();
  const [isMutatingList, startMutatingList] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeItems = activeTab === 'categories' ? categories : colors;

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeItems;

    return activeItems.filter((item) => {
      const haystack = [item.name, item.slug, activeTab === 'colors' ? (item as ColorItem).hex : '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [activeItems, activeTab, searchQuery]);

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item.id));

  const slugPreview = modal.mode === 'edit' ? modal.slug ?? '' : slugify(nameInput);

  function resetModalForm() {
    setNameInput('');
    setHexInput('#000000');
  }

  function openCreateModal(tab: TabKey) {
    resetModalForm();
    setModal({ open: true, mode: 'create', tab });
  }

  function openEditModalCategory(item: CategoryItem) {
    setNameInput(item.name);
    setModal({
      open: true,
      mode: 'edit',
      tab: 'categories',
      id: item.id,
      slug: item.slug,
    });
  }

  function openEditModalColor(item: ColorItem) {
    setNameInput(item.name);
    setHexInput(item.hex);
    setModal({
      open: true,
      mode: 'edit',
      tab: 'colors',
      id: item.id,
      slug: item.slug,
      currentHex: item.hex,
    });
  }

  function closeModal() {
    setModal((prev) => ({ ...prev, open: false }));
    resetModalForm();
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function onToggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleToggleSelectAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const item of filteredItems) {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    if (searchQuery.trim()) {
      toast.error('Disable search to reorder the full list.');
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (activeTab === 'categories') {
      const previous = categories;
      const oldIndex = previous.findIndex((item) => item.id === active.id);
      const newIndex = previous.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const moved = arrayMove(previous, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      setCategories(moved);

      startMutatingList(async () => {
        const result = await updateCategorySortOrderAction(
          moved.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))
        );

        if (!result.success) {
          setCategories(previous);
          toast.error(result.message || 'Category order could not be updated.');
          return;
        }

        toast.success('Category order updated.');
      });

      return;
    }

    const previous = colors;
    const oldIndex = previous.findIndex((item) => item.id === active.id);
    const newIndex = previous.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(previous, oldIndex, newIndex).map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    setColors(moved);

    startMutatingList(async () => {
      const result = await updateColorSortOrderAction(
        moved.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))
      );

      if (!result.success) {
        setColors(previous);
        toast.error(result.message || 'Color order could not be updated.');
        return;
      }

      toast.success('Color order updated.');
    });
  }

  function handleSaveItem() {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      toast.error('Name is required.');
      return;
    }

    if (!modal.open) return;

    startSaving(async () => {
      if (modal.tab === 'categories') {
        if (modal.mode === 'create') {
          const result = await createCategoryAction({ name: trimmedName });
          if (!result.success || !result.data) {
            toast.error(result.message || 'Category could not be created.');
            return;
          }

          const created = result.data;
          if (
            typeof created.id !== 'string' ||
            typeof created.name !== 'string' ||
            typeof created.slug !== 'string' ||
            typeof created.isActive !== 'boolean' ||
            typeof created.sortOrder !== 'number' ||
            !created.createdAt
          ) {
            toast.error('Category response is invalid.');
            return;
          }

          const nextCategory: CategoryItem = {
            id: created.id,
            name: created.name,
            slug: created.slug,
            isActive: created.isActive,
            sortOrder: created.sortOrder,
            createdAt: new Date(created.createdAt).toISOString(),
          };

          setCategories((prev) => [
            ...prev,
            nextCategory,
          ]);
          toast.success('Category created.');
          closeModal();
          return;
        }

        if (!modal.id) return;
        const result = await updateCategoryNameAction(modal.id, trimmedName);
        if (!result.success) {
          toast.error(result.message || 'Category name could not be updated.');
          return;
        }

        setCategories((prev) =>
          prev.map((item) => (item.id === modal.id ? { ...item, name: trimmedName } : item))
        );
        toast.success('Category name updated.');
        closeModal();
        return;
      }

      if (modal.mode === 'create') {
        const normalizedHex = hexInput.trim().toUpperCase();
        const result = await createColorAction({
          name: trimmedName,
          hex: normalizedHex,
        });

        if (!result.success || !result.data) {
          toast.error(result.message || 'Color could not be created.');
          return;
        }

        const created = result.data;
        if (
          typeof created.id !== 'string' ||
          typeof created.name !== 'string' ||
          typeof created.hex !== 'string' ||
          typeof created.slug !== 'string' ||
          typeof created.isActive !== 'boolean' ||
          typeof created.sortOrder !== 'number' ||
          !created.createdAt
        ) {
          toast.error('Color response is invalid.');
          return;
        }

        const nextColor: ColorItem = {
          id: created.id,
          name: created.name,
          hex: created.hex,
          slug: created.slug,
          isActive: created.isActive,
          sortOrder: created.sortOrder,
          createdAt: new Date(created.createdAt).toISOString(),
        };

        setColors((prev) => [
          ...prev,
          nextColor,
        ]);
        toast.success('Color created.');
        closeModal();
        return;
      }

      if (!modal.id) return;
      const result = await updateColorNameAction(modal.id, trimmedName);
      if (!result.success) {
        toast.error(result.message || 'Color name could not be updated.');
        return;
      }

      setColors((prev) => prev.map((item) => (item.id === modal.id ? { ...item, name: trimmedName } : item)));
      toast.success('Color name updated.');
      closeModal();
    });
  }

  function handleToggleSingleStatus(id: string, isActive: boolean) {
    startMutatingList(async () => {
      if (activeTab === 'categories') {
        const result = await updateCategoryStatusAction(id, isActive);
        if (!result.success) {
          toast.error(result.message || 'Category status could not be updated.');
          return;
        }

        setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, isActive } : item)));
        return;
      }

      const result = await updateColorStatusAction(id, isActive);
      if (!result.success) {
        toast.error(result.message || 'Color status could not be updated.');
        return;
      }

      setColors((prev) => prev.map((item) => (item.id === id ? { ...item, isActive } : item)));
    });
  }

  function handleBulkStatus(isActive: boolean) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    startMutatingList(async () => {
      if (activeTab === 'categories') {
        const result = await bulkUpdateCategoryStatusAction(ids, isActive);
        if (!result.success) {
          toast.error(result.message || 'Bulk category status update failed.');
          return;
        }

        setCategories((prev) =>
          prev.map((item) => (ids.includes(item.id) ? { ...item, isActive } : item))
        );
      } else {
        const result = await bulkUpdateColorStatusAction(ids, isActive);
        if (!result.success) {
          toast.error(result.message || 'Bulk color status update failed.');
          return;
        }

        setColors((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, isActive } : item)));
      }

      clearSelection();
      toast.success(isActive ? 'Selected items set to active.' : 'Selected items set to passive.');
    });
  }

  function handleDeleteClick(item: CategoryItem | ColorItem, tab: TabKey) {
    startMutatingList(async () => {
      if (tab === 'categories') {
        const probe = await deleteCategoryAction({ id: item.id, force: false });
        const usageCount = probe.success ? probe.data?.usageCount ?? 0 : probe.usageCount ?? 0;
        setDeleteConfirm({
          open: true,
          tab,
          id: item.id,
          usageCount,
          label: item.name,
        });
        return;
      }

      const probe = await deleteColorAction({ id: item.id, force: false });
      const usageCount = probe.success ? probe.data?.usageCount ?? 0 : probe.usageCount ?? 0;
      setDeleteConfirm({
        open: true,
        tab,
        id: item.id,
        usageCount,
        label: item.name,
      });
    });
  }

  function handleDeleteConfirm() {
    if (!deleteConfirm) return;

    startMutatingList(async () => {
      if (deleteConfirm.tab === 'categories') {
        const result = await deleteCategoryAction({ id: deleteConfirm.id, force: true });
        if (!result.success) {
          toast.error(result.message || 'Category could not be deleted.');
          return;
        }

        setCategories((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
      } else {
        const result = await deleteColorAction({ id: deleteConfirm.id, force: true });
        if (!result.success) {
          toast.error(result.message || 'Color could not be deleted.');
          return;
        }

        setColors((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
      }

      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteConfirm.id);
        return next;
      });

      setDeleteConfirm(null);
      toast.success('Item deleted.');
    });
  }

  const currentTitle = activeTab === 'categories' ? 'Categories' : 'Colors';

  return (
    <div className="space-y-6">
      {/* Public website uses only isActive=true items for filters; admin product forms can use all items. */}

      <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('categories');
            clearSelection();
            setSearchQuery('');
          }}
          className={[
            'inline-flex min-h-10 items-center border px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
            activeTab === 'categories'
              ? 'border-white bg-white text-black'
              : 'border-[#2a2a2a] text-[#8e8e8e] hover:border-white hover:text-white',
          ].join(' ')}
        >
          Categories
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('colors');
            clearSelection();
            setSearchQuery('');
          }}
          className={[
            'inline-flex min-h-10 items-center border px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
            activeTab === 'colors'
              ? 'border-white bg-white text-black'
              : 'border-[#2a2a2a] text-[#8e8e8e] hover:border-white hover:text-white',
          ].join(' ')}
        >
          Colors
        </button>
      </div>

      <div className="space-y-4 border border-[#2a2a2a] bg-[#0e0e0e] p-4 md:p-6">
        <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCreateModal(activeTab)}
              className="inline-flex min-h-10 items-center border border-white bg-white px-4 text-xs font-semibold uppercase tracking-[0.1em] text-black"
            >
              <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
              Add New
            </button>

            <label className="inline-flex min-h-10 items-center gap-2 border border-[#2a2a2a] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3]">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(event) => handleToggleSelectAll(event.target.checked)}
                className="h-4 w-4"
              />
              Select All
            </label>

            {selectedCount > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkStatus(true)}
                  disabled={isMutatingList}
                  className="inline-flex min-h-10 items-center border border-[#1f4f2f] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#86efac] transition-colors hover:border-[#86efac] disabled:opacity-50"
                >
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  Set Active
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkStatus(false)}
                  disabled={isMutatingList}
                  className="inline-flex min-h-10 items-center border border-[#3b2929] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f0c2c2] transition-colors hover:border-[#f0c2c2] disabled:opacity-50"
                >
                  <ShieldX className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  Set Passive
                </button>
              </div>
            ) : null}
          </div>

          <div className="w-full max-w-md border-b border-[#8e8e8e] px-2 focus-within:border focus-within:border-white">
            <label htmlFor="settings-filter-search" className="sr-only">
              Search filters
            </label>
            <div className="flex min-h-12 items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-[#8e8e8e]" aria-hidden="true" />
              <input
                id="settings-filter-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${currentTitle.toLowerCase()}`}
                className="h-12 w-full bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border border-[#2a2a2a]">
          <div className="grid grid-cols-[40px_44px_minmax(0,1fr)_120px_auto] items-center gap-3 border-b border-[#2a2a2a] bg-[#131313] px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">
            <span />
            <span className="text-center">Move</span>
            <span>Name</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="max-h-[32rem] overflow-y-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredItems.map((item) => item.id)} strategy={rectSortingStrategy}>
                {filteredItems.map((item) => (
                  <SortableFilterRow
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    slug={item.slug}
                    isActive={item.isActive}
                    hex={activeTab === 'colors' ? (item as ColorItem).hex : undefined}
                    selected={selectedIds.has(item.id)}
                    tab={activeTab}
                    onToggleSelect={onToggleSelect}
                    onToggleStatus={handleToggleSingleStatus}
                    onEdit={() => {
                      if (activeTab === 'categories') {
                        openEditModalCategory(item as CategoryItem);
                      } else {
                        openEditModalColor(item as ColorItem);
                      }
                    }}
                    onDelete={() => handleDeleteClick(item, activeTab)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {filteredItems.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-[#8e8e8e]">
                No {currentTitle.toLowerCase()} match your search.
              </div>
            ) : null}
          </div>
        </div>

        {searchQuery.trim() ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">
            Clear search to reorder the full list via drag and drop.
          </p>
        ) : null}
      </div>

      {modal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg border border-[#2a2a2a] bg-[#0e0e0e] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#2a2a2a] pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">{modal.tab}</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {modal.mode === 'create' ? 'Add New' : 'Edit'} {modal.tab === 'categories' ? 'Category' : 'Color'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex min-h-10 min-w-10 items-center justify-center border border-[#2a2a2a] text-[#8e8e8e] transition-colors hover:border-white hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Name</span>
                <input
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder={modal.tab === 'categories' ? 'e.g. Dining Tables' : 'e.g. Kirmizi'}
                  className="min-h-11 w-full border border-[#2a2a2a] bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white"
                />
              </label>

              {modal.tab === 'colors' ? (
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Hex Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hexInput}
                      onChange={(event) => setHexInput(event.target.value.toUpperCase())}
                      disabled={modal.mode === 'edit'}
                      className="h-11 w-14 border border-[#2a2a2a] bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <input
                      value={hexInput}
                      onChange={(event) => setHexInput(event.target.value.toUpperCase())}
                      disabled={modal.mode === 'edit'}
                      placeholder="#FF0000"
                      className="min-h-11 w-full border border-[#2a2a2a] bg-transparent px-3 text-sm text-white outline-none transition-colors focus:border-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span
                      className="inline-block h-8 w-8 rounded-full border border-[#8e8e8e]"
                      style={{ backgroundColor: hexInput }}
                      aria-label="Hex preview"
                    />
                  </div>
                  {modal.mode === 'edit' ? (
                    <p className="mt-1 text-[11px] text-[#8e8e8e]">Hex is shown for reference in edit mode.</p>
                  ) : null}
                </label>
              ) : null}

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Slug (Read Only)</span>
                <input
                  value={slugPreview}
                  readOnly
                  className="min-h-11 w-full border border-[#2a2a2a] bg-[#141414] px-3 text-sm text-[#a7a7a7] outline-none"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#2a2a2a] pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex min-h-10 items-center border border-[#2a2a2a] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveItem}
                disabled={isSaving}
                className="inline-flex min-h-10 items-center border border-white bg-white px-4 text-xs font-semibold uppercase tracking-[0.1em] text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteConfirm?.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-md border border-[#2a2a2a] bg-[#0e0e0e] p-5 md:p-6">
            <div className="mb-4 border-b border-[#2a2a2a] pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Confirm Delete</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Delete {deleteConfirm.label}?</h3>
            </div>

            <p className="text-sm leading-relaxed text-[#c4c7c8]">
              This {deleteConfirm.tab === 'categories' ? 'category' : 'color'} is used by {deleteConfirm.usageCount} products. Are you sure?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#2a2a2a] pt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="inline-flex min-h-10 items-center border border-[#2a2a2a] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isMutatingList}
                className="inline-flex min-h-10 items-center border border-[#3b2929] bg-[#261414] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#f0c2c2] transition-colors hover:border-[#f0c2c2] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
