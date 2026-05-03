'use client';

import { useRef, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createInventoryProductAction } from '@/lib/actions/inventory-actions';
import { CATEGORY_VALUES, COLOR_VALUES } from '@/lib/product-config';

export default function InventoryCreateFormClient() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreateInventoryProduct(formData: FormData) {
    // Action sonucunu istemci tarafinda yakalayip hem toast hem de inline hata state'i uretiyoruz.
    startTransition(async () => {
      setFormError(null);

      const result = await createInventoryProductAction(formData);

      if (!result.success) {
        const message = result.message || 'ÃœrÃ¼n oluÅŸturulamadÄ±.';
        setFormError(message);
        toast.error(message);
        return;
      }

      // Basarili durumda edit sayfasÄ±na yÃ¶nlendiriyoruz â€” ImageManager orada mevcut.
      toast.success('ÃœrÃ¼n baÅŸarÄ±yla eklendi. FotoÄŸraf eklemek iÃ§in dÃ¼zenleme sayfasÄ±na yÃ¶nlendiriliyorsunuz...');
      const productId = result.data?.id;
      if (productId) {
        router.push(`/admin/inventory/${productId}/edit`);
      } else {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border border-[#2a2a2a] p-4">
        <h2 className="font-[Inter,sans-serif] text-sm font-semibold uppercase tracking-[0.1em] text-white">
          Create New Product
        </h2>
      </div>

      <form ref={formRef} action={handleCreateInventoryProduct} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input name="sku" placeholder="SKU (TWW-XX-001)" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <input name="slug" placeholder="slug-example" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />

        <select name="category" className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white" defaultValue="dining-tables">
          {CATEGORY_VALUES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select name="color" className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white" defaultValue="Anthracite">
          {COLOR_VALUES.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        <input name="price" type="number" step="0.01" min="0" placeholder="Price" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <input name="stock" type="number" min="0" placeholder="Stock" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <input name="colorHex" placeholder="#383838" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        
        {/* Placeholder for creation, actual images are added in the edit screen via ImageManager */}
        <input type="hidden" name="images" value="https://res.cloudinary.com/tww/placeholder" />

        <input name="width" type="number" min="1" placeholder="Width" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <input name="height" type="number" min="1" placeholder="Height" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <input name="depth" type="number" min="1" placeholder="Depth" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white md:col-span-2" required />

        <input name="nameTr" placeholder="TR Name" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <input name="materialTr" placeholder="TR Material" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <textarea name="descriptionTr" placeholder="TR Description" className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white md:col-span-2" required />

        <input name="nameEn" placeholder="EN Name" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <input name="materialEn" placeholder="EN Material" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
        <textarea name="descriptionEn" placeholder="EN Description" className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white md:col-span-2" required />

        <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8e8e8e]">
          <input type="checkbox" name="featured" className="h-4 w-4" />
          Featured product
        </label>

        {/* useFormState kullanmasak da hata mesajini gorunur tutarak basarisiz durumda net feedback sagliyoruz. */}
        {formError ? (
          <p className="md:col-span-2 text-sm text-[#ff8a8a]" aria-live="polite">
            {formError}
          </p>
        ) : null}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center justify-center border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.1em] text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}





