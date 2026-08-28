'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await signUp(email, password, fullName);
    if (error) setError(error);
    else router.push('/auth/login?registered=true');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gh-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gh-accent to-gh-purple flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gh-text-primary">Create account</h1>
          <p className="text-gh-text-secondary mt-1">Join GlobalHub today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-gh-error/10 border border-gh-error/20 text-gh-error text-sm">{error}</div>}
          <div>
            <label className="gh-label">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="gh-input" required />
          </div>
          <div>
            <label className="gh-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="gh-input" required />
          </div>
          <div>
            <label className="gh-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="gh-input" required minLength={8} />
            <p className="text-xs text-gh-text-muted mt-1">Min 8 characters</p>
          </div>
          <button type="submit" disabled={loading} className="gh-btn-primary w-full">{loading ? 'Creating account...' : 'Get Started'}</button>
        </form>
        <p className="text-center text-sm text-gh-text-muted mt-6">
          Already have an account? <Link href="/auth/login" className="text-gh-accent-light hover:text-gh-accent">Sign In</Link>
        </p>
      </div>
    </div>
  );
}