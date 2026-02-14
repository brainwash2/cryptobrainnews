export default function HomepageLoading() {
  return (
    <div className="container mx-auto px-4 lg:px-8 pt-4">
      <div className="h-[500px] bg-white/5 animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
