export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
      <div className="w-12 h-12 rounded-full border-2 border-foreground/10 border-t-foreground animate-spin" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading experience...</p>
    </div>
  );
}
