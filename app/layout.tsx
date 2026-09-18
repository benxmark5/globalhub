import type { Metadata } from "next";
import "./globals.css";
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

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <NavShell user={user} />
          <VisitorTracker />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </main>
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}