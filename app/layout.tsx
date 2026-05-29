import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./lib/cart";
import Navbar from "@/components/Navbar"; // 💡 Import your new Navbar

export const metadata: Metadata = {
  title: "GlobalHub — Sports Signals",
  description: "Professional sports signals worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Navbar is outside CartProvider because it's global UI */}
        <Navbar /> 
        
        <CartProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}