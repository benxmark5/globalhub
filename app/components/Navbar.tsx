"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0a1628] border-b border-[#1a2740] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl tracking-tighter">GlobalHub</Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/football" className="hover:text-green-500 transition">Football</Link>
            <Link href="/aviator" className="hover:text-green-500 transition">Aviator</Link>
            <Link href="/login" className="bg-[#1a2740] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition">
              <User size={16} /> Log In
            </Link>
          </div>

          {/* Mobile Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden p-4 bg-[#0f1f33] space-y-4">
          <Link href="/football" className="block">Football</Link>
          <Link href="/aviator" className="block">Aviator</Link>
          <Link href="/login" className="block text-green-500 font-bold">Log In</Link>
        </div>
      )}
    </nav>
  );
}