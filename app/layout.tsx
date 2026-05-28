import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./lib/cart";
// 💡 We removed the AuthProvider import line entirely

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
        {/* 💡 We removed the <AuthProvider> tags entirely */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}