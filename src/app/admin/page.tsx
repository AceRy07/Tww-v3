export default function AdminDashboardPage() {
  return (
    <section className="mx-auto w-full max-w-[1440px] border border-[#2a2a2a] bg-[#0e0e0e]/70 p-8 backdrop-blur-xl md:p-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8e9192]">Dashboard</p>
      <h1 className="mt-3 text-4xl font-semibold leading-none tracking-[-0.02em] text-white md:text-5xl">
        Admin Panel
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#c4c7c8]">
        Fixed sidebar navigation with independent content scrolling is now configured. Add Kanban, Inventory,
        Calculator, and Settings pages under the admin route to complete each module.
      </p>
    </section>
  );
}
