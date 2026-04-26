'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import { useAuthStore } from '@/store/authStore';
import { ChevronUp } from 'lucide-react';
import Link from 'next/link';

function HomeContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [radius, setRadius] = useState(50); // km
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryName = searchParams.get('category') || '';

  useEffect(() => {
    fetchProducts();
  }, [user, categoryName, radius]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products?`;
      if (categoryName) {
        url += `categoryName=${encodeURIComponent(categoryName)}&`;
      }
      if (user?.location?.coordinates) {
        url += `lng=${user.location.coordinates[0]}&lat=${user.location.coordinates[1]}&radius=${radius}`;
      }
      const { data } = await axios.get(url);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories');
    }
  };

  return (
    <div className="bg-white min-h-screen text-[#002f34]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

        {/* Breadcrumb */}
        <div className="text-xs text-[#406367] mb-2">
          <Link href="/" className="hover:underline">Home</Link>
          {' / '}
          <span>{categoryName || 'All Items'}</span>
        </div>

        <h1 className="text-[28px] font-bold text-[#002f34] mb-1 tracking-tight">
          {categoryName ? `${categoryName}` : 'Buy & Sell Used Items'}
        </h1>
        <p className="text-sm text-[#406367] mb-6">
          {categoryName
            ? `Showing listings for "${categoryName}"`
            : `Find a diverse range of pre-owned items with ${products.length} listings locally.`}
        </p>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="border border-gray-200 rounded overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-sm text-[#002f34] uppercase tracking-wider">Categories</h3>
                <ChevronUp className="h-4 w-4 text-[#406367]" />
              </div>
              <ul>
                <li>
                  <Link href="/"
                    className={`flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 transition-colors ${!categoryName ? 'font-bold text-[#002f34] bg-gray-50' : 'text-[#406367] hover:bg-gray-50 hover:text-[#002f34]'}`}>
                    All Categories
                  </Link>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat._id}>
                    <Link href={`/?category=${encodeURIComponent(cat.name)}`}
                      className={`flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 transition-colors ${categoryName === cat.name ? 'font-bold text-[#002f34] bg-gray-50' : 'text-[#406367] hover:bg-gray-50 hover:text-[#002f34]'}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Distance Filter - only shown when user has location */}
            {user?.location?.coordinates && (
              <div className="border border-gray-200 rounded overflow-hidden mt-4">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-sm text-[#002f34] uppercase tracking-wider">Distance</h3>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-xs text-[#406367] mb-2">
                    <span>Nearby</span>
                    <span className="font-bold text-[#002f34]">{radius} km</span>
                    <span>Far</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    step={1}
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="w-full accent-[#002f34]"
                  />
                  <p className="text-xs text-[#406367] mt-2 text-center">Showing products within <span className="font-bold text-[#002f34]">{radius} km</span></p>
                </div>
              </div>
            )}

            {/* No location hint */}
            {!user?.location?.coordinates && (
              <div className="border border-dashed border-gray-300 rounded mt-4 p-4 text-center">
                <p className="text-xs text-[#406367] mb-2">Enable location in your profile to see nearby products & distances</p>
                <Link href="/profile" className="text-xs font-bold text-[#002f34] underline hover:no-underline">Update Location →</Link>
              </div>
            )}
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-[#002f34]">
              <span className="font-bold">{products.length} ads</span>
              {categoryName && <span className="text-[#406367]"> in "{categoryName}"</span>}
              {user?.location && <span className="text-[#406367]"> near you</span>}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-white border border-gray-200 rounded p-2 animate-pulse">
                    <div className="w-full h-[160px] bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-gray-200 rounded">
                <h3 className="text-xl font-bold text-[#002f34] mb-2">No results found</h3>
                <p className="text-[#406367] mb-4">
                  {categoryName
                    ? `No products listed under "${categoryName}" yet.`
                    : 'Try adjusting your filters or location.'}
                </p>
                {categoryName && (
                  <Link href="/" className="inline-block text-sm font-bold text-[#002f34] underline hover:no-underline">
                    View all listings →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-white text-[#002f34]">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
