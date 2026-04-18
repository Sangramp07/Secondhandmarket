'use client';

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, removeItem, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-bold text-[#002f34] mb-8">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-20 border border-gray-200 rounded-xl bg-gray-50">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-[#002f34] mb-2">Your cart is empty</h2>
            <p className="text-[#406367] mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/" className="inline-block bg-[#002f34] text-white font-bold py-3 px-8 rounded-full hover:bg-[#00a49f] transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-bold text-[#002f34] uppercase text-sm">Items ({items.length})</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.product} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-lg text-[#002f34] mb-1">{item.title}</h4>
                        <p className="text-[#406367] text-sm">Seller ID: {item.seller.slice(-6)}...</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-[#002f34] mb-2">₹{item.price.toLocaleString('en-IN')}</div>
                        <button 
                          onClick={() => removeItem(item.product)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center justify-center sm:justify-end w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-[400px]">
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 sticky top-24">
                <h3 className="font-bold text-xl text-[#002f34] mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6 text-[#406367]">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} items)</span>
                    <span>₹{getTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-2xl text-[#002f34]">
                    <span>Total</span>
                    <span>₹{getTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <Link 
                  href="/checkout"
                  className="w-full bg-[#002f34] hover:bg-[#00a49f] text-white font-bold py-4 px-6 rounded flex items-center justify-center transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
