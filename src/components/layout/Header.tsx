'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVinylStore } from '@/lib/store/vinylStore';
import { Button } from '@/components/ui/Button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
              House Aquemini
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
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
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-steel-700 bg-steel-800">
          <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
            <MobileNavLink
              href="/collection"
              isActive={isActive('/collection')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Collection
            </MobileNavLink>
            <MobileNavLink
              href="/wishlist"
              isActive={isActive('/wishlist')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Wishlist
            </MobileNavLink>
          </nav>
          {user && (
            <div className="px-4 py-3 border-t border-steel-700">
              <span className="block text-sm text-steel-400 font-mono mb-2">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-center"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      )}
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

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, isActive, onClick, children }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        block px-3 py-2 rounded text-base font-medium transition-colors focus-ring
        ${
          isActive
            ? 'bg-steel-700 text-brass-400'
            : 'text-steel-400 hover:text-brass-400 hover:bg-steel-700'
        }
      `}
    >
      {children}
    </Link>
  );
}
