export default function Loading() {
  return (
    <div className="p-4 md:p-6">
      <div className="theme-border border rounded-2xl p-4 md:p-6 theme-bg shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl theme-border border" />
          <div className="flex-1">
            <div className="h-6 w-48 theme-border border rounded" />
            <div className="mt-2 h-4 w-64 theme-border border rounded" />
          </div>
        </div>
        <div className="mt-6 h-24 theme-border border rounded-xl" />
      </div>
    </div>
  );
}
