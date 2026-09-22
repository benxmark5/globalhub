// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "../lib/theme.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/lib/cart";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ChatWidget from "./components/ChatWidget";
import NavShell from "./components/NavShell";
import VisitorTracker from "./components/VisitorTracker";

export const metadata: Metadata = {
  title: "GlobalHub — Sports Signals",
  description: "Professional sports signals worldwide",
};

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* no-op in RSC */ },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user ? {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata as { full_name?: string; avatar_url?: string },
    } : null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Inline script to set data-theme BEFORE React hydrates (prevents flash)
  const themeScript = `
    (function() {
      try {
        var t = localStorage.getItem('gh_theme');
        if (t !== 'light' && t !== 'dark') t = 'dark';
        document.documentElement.setAttribute('data-theme', t);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
            <body>
        <AuthProvider>
          <CartProvider>
            <NavShell user={user} />
            <VisitorTracker />
            <main style={{ minHeight: 'calc(100vh - 64px)' }}>
              {children}
            </main>
            <ChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}