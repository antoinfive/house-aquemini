import Link from 'next/link';

export default function VinylNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <svg
          className="w-24 h-24 text-steel-600 mx-auto mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="1" />
          <circle cx="12" cy="12" r="4" strokeWidth="1" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <path strokeLinecap="round" strokeWidth="1" d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
        <h1 className="text-2xl font-bold text-steel-100 mb-2 font-[family-name:var(--font-display)]">
          Vinyl Not Found
        </h1>
        <p className="text-steel-400 mb-6">
          This record doesn&apos;t exist in the collection.
        </p>
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brass-600 hover:bg-brass-500 text-steel-950 font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Collection
        </Link>
      </div>
    </div>
  );
}
