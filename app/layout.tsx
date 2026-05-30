import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./lib/cart";
import ChatWidget from "./components/ChatWidget";

export const metadata: Metadata = {
  title: "GlobalHub — Sports Signals",
  description: "Professional sports signals for winners worldwide in 100+ countries",
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
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}