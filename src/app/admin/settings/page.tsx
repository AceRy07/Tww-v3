import { asc } from 'drizzle-orm';
import SettingsFiltersClient from '@/components/admin/SettingsFiltersClient';
import { categories, colors } from '@/db/schema';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getSafeIsoDate(dateVal: any): string {
  if (!dateVal) return new Date().toISOString();
  const d = new Date(dateVal);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export default async function AdminSettingsPage() {
  let categoryRows: Array<typeof categories.$inferSelect> = [];
  let colorRows: Array<typeof colors.$inferSelect> = [];

  try {
    [categoryRows, colorRows] = await Promise.all([
      db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.createdAt)),
      db.select().from(colors).orderBy(asc(colors.sortOrder), asc(colors.createdAt)),
    ]);
  } catch (error) {
    console.error('[admin/settings] Failed to load categories or colors:', error);
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] border border-[#2a2a2a] bg-[#131313] p-5 md:p-8">
      <div className="mb-8 flex flex-col gap-3 border-b border-[#2a2a2a] pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8e8e8e]">Admin Settings</p>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">Filters</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#c4c7c8]">
          Manage category and color filters used in inventory and public catalog experiences.
        </p>
      </div>

      <SettingsFiltersClient
        initialCategories={categoryRows.map((item) => ({
          ...item,
          createdAt: getSafeIsoDate(item.createdAt),
        }))}
        initialColors={colorRows.map((item) => ({
          ...item,
          createdAt: getSafeIsoDate(item.createdAt),
        }))}
      />
    </section>
  );
}
