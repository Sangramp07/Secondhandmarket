'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Search, Heart, User, Plus, ShoppingCart, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();

  const handleSellClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/add-product');
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="bg-[#f2f4f5] border-b border-gray-200 sticky top-0 z-50">
      <div className="bg-white px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link
              href="/"
              title="Go to Home"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-[#002f34] hover:bg-[#00a49f] transition-colors shadow"
            >
              <Home className="h-5 w-5 text-white" />
            </Link>
            <Link href="/" className="text-3xl font-extrabold text-[#002f34] tracking-tighter">
              SecondHand
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center border-2 border-[#002f34] rounded bg-white overflow-hidden">
            <input
              type="text"
              className="w-full px-4 py-2.5 outline-none text-[#002f34]"
              placeholder="Find Cars, Mobile Phones and more..."
            />
            <button className="bg-[#002f34] p-3 flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 ml-2">
            <span className="hidden lg:flex font-bold text-[#002f34] cursor-pointer hover:underline">ENGLISH</span>
            
            {user ? (
              <>
                <Link href="/cart" className="relative text-[#002f34] hover:opacity-80 transition-opacity">
                  <ShoppingCart className="h-6 w-6" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Link>
                <Link href="/wishlist" className="text-[#002f34] hover:opacity-80 transition-opacity">
                  <Heart className="h-6 w-6" />
                </Link>
                <Link href="/profile" className="flex items-center text-[#002f34] hover:opacity-80">
                  <User className="h-6 w-6" />
                </Link>
              </>
            ) : (
              <Link href="/login" className="font-bold text-[#002f34] underline hover:no-underline">
                Login
              </Link>
            )}

            <button 
              onClick={handleSellClick}
              className="flex items-center justify-center gap-1 bg-white border-[5px] border-t-[#23e5db] border-l-[#ffce32] border-r-[#3a77ff] border-b-[#002f34] rounded-full px-5 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <Plus className="h-5 w-5 text-[#002f34] font-bold" />
              <span className="font-bold text-[#002f34]">SELL</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
