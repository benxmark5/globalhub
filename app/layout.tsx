import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./lib/cart";

export const metadata: Metadata = {
  title: "GlobalHub — Sports Signals",
  description: "Professional sports signals for winners worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}