'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.push('/collection');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md" padding="lg">
        <CardHeader>
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wood-100 dark:bg-analog-700 mb-4">
              <svg
                className="w-8 h-8 text-wood-600 dark:text-wood-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center">Welcome Back</CardTitle>
          <p className="text-center text-analog-500 dark:text-analog-400 mt-2">
            Sign in to manage your vinyl collection
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isSubmitting}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting || authLoading}
              disabled={isSubmitting || authLoading}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
