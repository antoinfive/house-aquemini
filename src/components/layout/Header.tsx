'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVinylStore } from '@/lib/store';
import { Button } from '@/components/ui';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isOwner, isLoading, signOut } = useAuth();
  const resetVinylStore = useVinylStore((state) => state.reset);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const handleSignOut = async () => {
    await signOut();
    resetVinylStore();
    router.push('/');
  };

  return (
    <header className="header-industrial sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-steel-700 border border-steel-600 flex items-center justify-center group-hover:border-brass-400 transition-colors">
              <svg
                className="w-5 h-5 text-brass-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-steel-100 tracking-tight">
              Aces Library
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <NavLink href="/gallery" isActive={isActive('/gallery')}>
              Gallery
            </NavLink>

            <NavLink href="/collection" isActive={isActive('/collection')}>
              Collection
            </NavLink>
            <NavLink href="/wishlist" isActive={isActive('/wishlist')}>
              Wishlist
            </NavLink>
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-8 bg-steel-700 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-steel-400 font-mono">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  Sign Out
                </Button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded hover:bg-steel-700 focus-ring text-steel-400 hover:text-brass-400 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`
        px-3 py-2 rounded text-sm font-medium transition-colors focus-ring tracking-wide
        ${
          isActive
            ? 'bg-steel-700 text-brass-400 border-b-2 border-brass-400'
            : 'text-steel-400 hover:text-brass-400 hover:bg-steel-800'
        }
      `}
    >
      {children}
    </Link>
  );
}
