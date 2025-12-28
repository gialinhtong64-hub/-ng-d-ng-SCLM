import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              YADEA
            </h3>
            <p className="text-sm mb-4 leading-relaxed">
              C么ng ty h脿ng 膽岷 v峄?xe 膽i峄噉 th么ng minh t岷 Vi峄噒 Nam. Mang 膽岷縩 gi岷 ph谩p di chuy峄僴 xanh, th芒n thi峄噉 m么i tr瓢峄漬g.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-start">
                <span className="mr-2">馃搷</span>
                <span>L么 O1-2, Khu c么ng nghi峄噋, T峄塶h B岷痗 Ninh, Vi峄噒 Nam</span>
              </p>
              <p>
                <span className="mr-2">馃摓</span>
                <a href="tel:1900636803" className="hover:text-blue-400 transition-colors">
                  Hotline: 1900 633 301
                </a>
              </p>
              <p>
                <span className="mr-2">鉁夛笍</span>
                <a href="mailto:support@YADEA.vn" className="hover:text-blue-400 transition-colors">
                  support@YADEA.vn
                </a>
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">S岷 Ph岷﹎</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=scooter" className="hover:text-blue-400 transition-colors">
                  Xe M谩y 膼i峄噉
                </Link>
              </li>
              <li>
                <Link href="/products?category=bike" className="hover:text-blue-400 transition-colors">
                  Xe 膼岷 膼i峄噉
                </Link>
              </li>
              <li>
                <Link href="/products?category=premium" className="hover:text-blue-400 transition-colors">
                  D貌ng Cao C岷
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="hover:text-blue-400 transition-colors">
                  S岷 Ph岷﹎ M峄沬
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="hover:text-blue-400 transition-colors">
                  Khuy岷縩 M茫i
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">V峄?Ch煤ng T么i</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  Gi峄沬 Thi峄噓
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-blue-400 transition-colors">
                  H峄?Th峄憂g C峄璦 H脿ng
                </Link>
              </li>
              <li>
                <Link href="/technology" className="hover:text-blue-400 transition-colors">
                  C么ng Ngh峄?
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-blue-400 transition-colors">
                  Tin T峄ヽ
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-blue-400 transition-colors">
                  Tuy峄僴 D峄g
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">H峄?Tr峄?/h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support" className="hover:text-blue-400 transition-colors">
                  H峄?Tr峄?& B岷 H脿nh
                </Link>
              </li>
              <li>
                <Link href="/payment" className="hover:text-blue-400 transition-colors">
                  Ph瓢啤ng Th峄ヽ Thanh To谩n
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-blue-400 transition-colors">
                  Ch铆nh S谩ch V岷璶 Chuy峄僴
                </Link>
              </li>
              <li>
                <Link href="/return" className="hover:text-blue-400 transition-colors">
                  Ch铆nh S谩ch 膼峄昳 Tr岷?
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                  Ch铆nh S谩ch B岷 M岷璽
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Li锚n H峄?
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">200+</div>
              <div className="text-sm">C峄璦 H脿ng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">50K+</div>
              <div className="text-sm">Kh谩ch H脿ng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">15+</div>
              <div className="text-sm">N膬m Kinh Nghi峄噈</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">100%</div>
              <div className="text-sm">S岷 Ph岷﹎ Ch铆nh H茫ng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-center md:text-left">
              漏 2025 YADEA. All rights reserved.
            </p>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-sm">Theo d玫i ch煤ng t么i:</span>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-blue-600 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-pink-600 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-red-600 rounded-full transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

