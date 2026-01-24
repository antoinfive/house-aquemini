import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative vinyl icon - Industrial style */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-steel-800 border border-steel-600 shadow-xl relative brushed-metal">
              <div className="absolute inset-4 rounded-full bg-steel-900 border border-steel-700" />
              <div className="absolute inset-[40%] rounded-full bg-brass-400" />
              <div className="absolute inset-[45%] rounded-full bg-steel-900" />
            </div>
            {/* Brass glow effect */}
            <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full brass-glow opacity-30" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-steel-100 mb-6 leading-tight tracking-tight">
            A Personal Vinyl Collection
          </h1>

          <p className="text-lg text-steel-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Discover a curated collection of vinyl records,
            from classic jazz to contemporary sounds.
            Experience precision audio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/gallery"
              className="btn-primary px-8 py-3 rounded text-base font-medium focus-ring"
            >
              Browse Collection
            </Link>
            <Link
              href="/gallery"
              className="btn-outline px-8 py-3 rounded text-base font-medium focus-ring"
            >
              View Now Playing
            </Link>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 flex items-center gap-8 text-center">
          <div className="px-6">
            <div className="text-3xl font-bold text-brass-400 font-mono">80+</div>
            <div className="text-sm text-steel-500 uppercase tracking-wide">Records</div>
          </div>
          <div className="w-px h-12 bg-steel-700" />
          <div className="px-6">
            <div className="text-3xl font-bold text-brass-400 font-mono">12</div>
            <div className="text-sm text-steel-500 uppercase tracking-wide">Genres</div>
          </div>
          <div className="w-px h-12 bg-steel-700" />
          <div className="px-6">
            <div className="text-3xl font-bold text-brass-400 font-mono">1958</div>
            <div className="text-sm text-steel-500 uppercase tracking-wide">Oldest</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-steel-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-steel-500">
            Precision Audio — A vinyl collection management system
          </p>
        </div>
      </footer>
    </div>
  );
}
