import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware to handle Supabase auth session refresh.
 * Runs on every request to ensure sessions stay fresh.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not write code between createServerClient and
  // supabase.auth.getSession(). A simple mistake could lead to
  // hard-to-debug auth issues.

  // Use getSession() instead of getUser() to trigger session refresh
  // This will automatically refresh the session if the access token is expired
  // The new tokens are set via the setAll callback in the cookies config
  const { error } = await supabase.auth.getSession();

  // If there's an auth error (e.g., invalid refresh token), clear all Supabase cookies
  // Supabase SSR uses cookies like sb-{project-ref}-auth-token and may chunk them
  if (error) {
    const allCookies = request.cookies.getAll();
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        supabaseResponse.cookies.delete(cookie.name);
      }
    });
  }

  // IMPORTANT: Return the supabaseResponse to ensure cookies are set
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
