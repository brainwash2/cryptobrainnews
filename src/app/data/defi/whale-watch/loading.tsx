export default function WhaleWatchLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-white/5 mb-2" />
        <div className="h-4 w-48 bg-white/5" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/5 border border-white/5" />
        ))}
      </div>

      <div className="bg-white/5 border border-white/5 h-[600px]" />
    </div>
  );
}
