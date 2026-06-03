import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./lib/cart";
import ChatWidget from "./components/ChatWidget";
import GlobalNav from "./components/GlobalNav";

export const metadata: Metadata = {
  title: "GlobalHub — Sports Signals",
  description: "Professional sports signals worldwide",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <GlobalNav />
          {children}
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}