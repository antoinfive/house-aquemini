'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui';

export function Header() {
  const pathname = usePathname();
  const { user, isOwner, isLoading, signOut } = useAuth();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-wood-200 dark:border-analog-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-wood-500 flex items-center justify-center group-hover:bg-wood-600 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-analog-800 dark:text-wood-100">
              Aces Library
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <NavLink href="/gallery" isActive={isActive('/gallery')}>
              Gallery
            </NavLink>

            {isOwner && (
              <>
                <NavLink href="/collection" isActive={isActive('/collection')}>
                  Collection
                </NavLink>
                <NavLink href="/wishlist" isActive={isActive('/wishlist')}>
                  Wishlist
                </NavLink>
              </>
            )}
          </nav>

          {/* Auth section */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-8 bg-wood-100 dark:bg-analog-700 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-analog-600 dark:text-analog-400">
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
            ) : (
              <Link href="/login">
                <Button variant="vintage" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-wood-100 dark:hover:bg-analog-700 focus-ring"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-analog-600 dark:text-analog-400"
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
        px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring
        ${
          isActive
            ? 'bg-wood-100 dark:bg-analog-700 text-wood-700 dark:text-wood-200'
            : 'text-analog-600 dark:text-analog-400 hover:text-analog-800 dark:hover:text-wood-200 hover:bg-wood-50 dark:hover:bg-analog-800'
        }
      `}
    >
      {children}
    </Link>
  );
}
