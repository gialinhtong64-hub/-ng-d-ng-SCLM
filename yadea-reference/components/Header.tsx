'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <a href="tel:1900636803" className="hover:text-blue-400 transition-colors">
                <span className="mr-1">馃摓</span> Hotline: 1900 633 301
              </a>
              <a href="mailto:support@yadeavn.com" className="hidden md:inline hover:text-blue-400 transition-colors">
                <span className="mr-1">鉁夛笍</span> support@yadeavn.com
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/stores" className="hover:text-blue-400 transition-colors">
                C峄璦 H脿ng
              </Link>
              <Link href="/support" className="hover:text-blue-400 transition-colors">
                H峄?Tr峄?
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              YADEA
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Trang Ch峄?
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center">
                S岷 Ph岷﹎
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <Link href="/products?category=scooter" className="block px-4 py-3 hover:bg-gray-100 rounded-t-lg">
                  Xe M谩y 膼i峄噉
                </Link>
                <Link href="/products?category=bike" className="block px-4 py-3 hover:bg-gray-100">
                  Xe 膼岷 膼i峄噉
                </Link>
                <Link href="/products?category=premium" className="block px-4 py-3 hover:bg-gray-100 rounded-b-lg">
                  D貌ng Cao C岷
                </Link>
              </div>
            </div>
            <Link href="/technology" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              C么ng Ngh峄?
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Tin T峄ヽ
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              V峄?Ch煤ng T么i
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Li锚n H峄?
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Test Drive Button */}
            <Link
              href="/test-drive"
              className="hidden md:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              膼膬ng K媒 L谩i Th峄?
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="relative">
              <input
                type="text"
                placeholder="T矛m ki岷縨 s岷 ph岷﹎..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t">
          <nav className="px-4 py-4 space-y-3">
            <Link href="/" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
              Trang Ch峄?
            </Link>
            <Link href="/products" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
              S岷 Ph岷﹎
            </Link>
            <Link href="/technology" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
              C么ng Ngh峄?
            </Link>
            <Link href="/news" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
              Tin T峄ヽ
            </Link>
            <Link href="/about" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
              V峄?Ch煤ng T么i
            </Link>
            <Link href="/contact" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
              Li锚n H峄?
            </Link>
            <Link
              href="/test-drive"
              className="block w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg text-center"
            >
              膼膬ng K媒 L谩i Th峄?
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

