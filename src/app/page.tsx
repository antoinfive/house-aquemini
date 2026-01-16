import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-wood-200 bg-wood-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-wood-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-wood-800">Aces Library</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/gallery"
                className="text-analog-600 hover:text-wood-600 transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/login"
                className="btn-vintage px-4 py-2 rounded-lg text-sm font-medium focus-ring"
              >
                Owner Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative vinyl icon */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-analog-800 shadow-xl relative">
              <div className="absolute inset-4 rounded-full bg-analog-700" />
              <div className="absolute inset-[40%] rounded-full bg-wood-500" />
              <div className="absolute inset-[45%] rounded-full bg-analog-800" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-wood-800 mb-6 leading-tight">
            A Personal Vinyl Collection
          </h1>

          <p className="text-lg text-analog-500 mb-8 max-w-xl mx-auto leading-relaxed">
            Discover a curated collection of vinyl records,
            from classic jazz to contemporary sounds.
            Experience the warmth of analog music.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/gallery"
              className="btn-vintage px-8 py-3 rounded-lg text-lg font-medium focus-ring"
            >
              Browse Collection
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-3 rounded-lg text-lg font-medium text-wood-600 hover:text-wood-800 hover:bg-wood-100 transition-colors focus-ring"
            >
              View Now Playing
            </Link>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 flex items-center gap-8 text-center">
          <div className="px-6">
            <div className="text-3xl font-bold text-wood-600">80+</div>
            <div className="text-sm text-analog-500">Records</div>
          </div>
          <div className="w-px h-12 bg-wood-200" />
          <div className="px-6">
            <div className="text-3xl font-bold text-wood-600">12</div>
            <div className="text-sm text-analog-500">Genres</div>
          </div>
          <div className="w-px h-12 bg-wood-200" />
          <div className="px-6">
            <div className="text-3xl font-bold text-wood-600">1958</div>
            <div className="text-sm text-analog-500">Oldest</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-wood-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-analog-400">
            A Japanese listening room inspired vinyl collection
          </p>
        </div>
      </footer>
    </div>
  );
}
