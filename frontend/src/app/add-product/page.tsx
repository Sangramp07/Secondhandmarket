'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { MapPin, Upload, Tag, DollarSign, FileText, Camera, CheckCircle } from 'lucide-react';

export default function AddProductPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('Used');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<number[] | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
    fetchCategories();
  }, [user, router]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}/api/categories`);
      setCategories(data);
      if (data.length > 0) setCategory(data[0]._id);
    } catch (err) {
      console.error('Error fetching categories');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setAddress('Auto-detected location');
        },
        (err) => console.error(err)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('address', address);
    if (coordinates) formData.append('coordinates', JSON.stringify(coordinates));
    if (images) {
      for (let i = 0; i < images.length; i++) formData.append('images', images[i]);
    }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user?.token}` },
      });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const inputClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#002f34] text-[#002f34] bg-white transition-colors placeholder-gray-400 text-sm";

  return (
    <div className="bg-[#f2f4f5] min-h-screen text-[#002f34]">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#002f34]">Sell Your Product</h1>
          <p className="text-[#406367] mt-1 text-sm">Fill in the details below to list your item for sale.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border-l-4 border-red-500 p-4 rounded-lg mb-6 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Section 1: Product Details ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-[#002f34] bg-[#002f34]">
              <FileText className="h-5 w-5 text-white" />
              <h2 className="font-bold text-white text-sm uppercase tracking-widest">Product Details</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#002f34] mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  className={inputClass} placeholder="What are you selling? (e.g. iPhone 13, Cycle, Books)" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#002f34] mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)}
                  className={inputClass} placeholder="Describe your item — include brand, model, age, and any defects..." />
              </div>
            </div>
          </div>

          {/* ── Section 2: Pricing & Category ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-[#00a49f] bg-[#00a49f]">
              <DollarSign className="h-5 w-5 text-white" />
              <h2 className="font-bold text-white text-sm uppercase tracking-widest">Pricing & Category</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#002f34] mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#406367] font-bold text-sm">₹</span>
                    <input type="number" required min="0" step="1" value={price} onChange={e => setPrice(e.target.value)}
                      className={`${inputClass} pl-7`} placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#002f34] mb-2">Condition</label>
                  <select value={condition} onChange={e => setCondition(e.target.value)} className={inputClass}>
                    <option value="New">🆕 New</option>
                    <option value="Like New">✨ Like New</option>
                    <option value="Used">📦 Used</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#002f34] mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required className={inputClass}>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Location ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-[#406367] bg-[#406367]">
              <MapPin className="h-5 w-5 text-white" />
              <h2 className="font-bold text-white text-sm uppercase tracking-widest">Location</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-[#002f34] mb-2">
                Address / Area <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input type="text" required value={address} onChange={e => setAddress(e.target.value)}
                  className={`${inputClass} flex-1`} placeholder="e.g. Pune, Maharashtra" />
                <button type="button" onClick={getLocation}
                  className="flex items-center gap-2 px-5 py-3 border-2 border-[#002f34] rounded-lg text-sm font-bold text-[#002f34] hover:bg-[#002f34] hover:text-white transition-colors whitespace-nowrap">
                  <MapPin className="h-4 w-4" />
                  Auto Detect
                </button>
              </div>
              {coordinates && (
                <div className="flex items-center gap-2 mt-3 text-green-600 text-xs font-bold">
                  <CheckCircle className="h-4 w-4" />
                  GPS location captured — buyers near you will see this ad first
                </div>
              )}
            </div>
          </div>

          {/* ── Section 4: Photos ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-[#ffce32] bg-[#ffce32]">
              <Camera className="h-5 w-5 text-[#002f34]" />
              <h2 className="font-bold text-[#002f34] text-sm uppercase tracking-widest">Photos (up to 5)</h2>
            </div>
            <div className="p-6">
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${images ? 'border-[#00a49f] bg-green-50' : 'border-gray-300 hover:border-[#002f34]'}`}>
                  {images ? (
                    <>
                      <CheckCircle className="mx-auto h-10 w-10 text-[#00a49f] mb-3" />
                      <p className="text-sm font-bold text-[#002f34]">{images.length} photo(s) selected</p>
                      <p className="text-xs text-[#406367] mt-1">Click to change</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-[#002f34]">Click to upload photos</p>
                      <p className="text-xs text-[#406367] mt-1">PNG, JPG, WEBP — first photo will be your cover image</p>
                    </>
                  )}
                </div>
                <input type="file" multiple accept="image/*" className="sr-only"
                  onChange={e => setImages(e.target.files)} />
              </label>
            </div>
          </div>

          {/* ── Submit Button ── */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#002f34] hover:bg-[#00a49f] text-white font-extrabold py-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-lg shadow-md tracking-wide">
            {loading ? '⏳ Publishing...' : '🚀 Post Ad Now'}
          </button>

        </form>
      </main>
    </div>
  );
}
