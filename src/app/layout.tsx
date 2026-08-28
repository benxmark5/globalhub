import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SystemProvider } from "@/context/systemcontext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GlobalHub Admin — Enterprise Hub",
  description: "Signal Management Automation & Administration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050505] text-white antialiased font-sans`}>
        <SystemProvider>
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </SystemProvider>
      </body>
    </html>
  );
}