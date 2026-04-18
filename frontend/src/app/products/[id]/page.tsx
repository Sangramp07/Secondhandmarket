'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { MapPin, Tag, Clock, ShieldCheck, MessageCircle, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function ProductDetailsPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const { user } = useAuthStore();
  const { addItem, items } = useCartStore();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!user) { router.push('/login'); return; }
    addItem({
      product: product._id,
      title: product.title,
      price: product.price,
      seller: product.seller._id,
      image: mainImage
    });
  };

  const isInCart = items.some(item => item.product === product?._id);

  const getImgSrc = (src: string) =>
    src.startsWith('http') ? src : `http://localhost:5000${src}`;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${params.id}`);
        setProduct(data);
        setMainImage(data.images?.length > 0
          ? getImgSrc(data.images[0])
          : 'https://via.placeholder.com/800x600?text=No+Image');
      } catch (error) {
        console.error('Error fetching product details');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProduct();
  }, [params.id]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-white text-[#002f34]">Loading...</div>;
  if (!product) return <div className="flex justify-center items-center h-screen bg-white text-[#002f34] text-2xl font-bold">Product not found</div>;

  return (
    <div className="bg-white min-h-screen text-[#002f34]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Breadcrumb */}
        <div className="text-xs text-[#406367] mb-4">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span>
          {' / '}
          <span>{product.category?.name}</span>
          {' / '}
          <span className="font-bold text-[#002f34]">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left – Image Gallery */}
          <div className="border border-gray-200 rounded overflow-hidden bg-gray-50">
            <div className="aspect-square w-full overflow-hidden bg-gray-200">
              <img src={mainImage} alt={product.title} className="object-cover w-full h-full" />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-gray-200">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(getImgSrc(img))}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${mainImage === getImgSrc(img) ? 'border-[#002f34]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={getImgSrc(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right – Product Info */}
          <div className="flex flex-col">

            {/* Category + Condition */}
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center text-xs font-bold text-[#406367] uppercase">
                <Tag className="h-3 w-3 mr-1" /> {product.category?.name}
              </span>
              <span className="bg-gray-100 text-[#002f34] text-xs font-bold px-2 py-0.5 rounded">
                {product.condition}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-[#002f34] mb-2 leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="text-3xl font-extrabold text-[#002f34] mb-4">
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-2 mb-5 text-sm text-[#406367]">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{product.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Posted {new Date(product.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-base font-bold text-[#002f34] mb-2">Description</h3>
              <p className="text-[#406367] text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Seller */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#002f34] flex items-center justify-center text-white font-bold text-lg">
                  {product.seller?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-[#406367]">Sold by</p>
                  <p className="font-bold text-[#002f34]">{product.seller?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`flex-1 font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-colors ${isInCart ? 'bg-green-600 text-white cursor-default' : 'bg-[#002f34] hover:bg-[#00a49f] text-white'}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {isInCart ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button className="flex-1 font-bold py-3 px-6 rounded border-2 border-[#002f34] text-[#002f34] hover:bg-[#002f34] hover:text-white flex items-center justify-center gap-2 transition-colors">
                <MessageCircle className="h-5 w-5" />
                Chat with Seller
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
