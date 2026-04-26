import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  address: string;
  condition: string;
  category: { name: string };
  distanceKm?: number | null;
  createdAt: string;
}

export default function ProductCard({ product }: { product: Product }) {
  // Support both Cloudinary full URLs and legacy local /uploads/ paths
  const getImageSrc = (src: string) => {
    if (!src) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (src.startsWith('http')) return src; // Cloudinary URL
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}${src}`; // legacy local
  };

  const imageUrl = product.images?.length > 0
    ? getImageSrc(product.images[0])
    : 'https://via.placeholder.com/400x300?text=No+Image';

  const date = new Date(product.createdAt);
  const formattedDate = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  const distanceLabel = product.distanceKm != null
    ? product.distanceKm < 1
      ? `< 1 km away`
      : `${product.distanceKm} km away`
    : null;

  return (
    <Link href={`/products/${product._id}`} className="block">
      <div className="bg-white border border-gray-300 rounded overflow-hidden flex flex-col h-full hover:shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-shadow">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 p-2">
          <img
            src={imageUrl}
            alt={product.title}
            className="object-cover w-full h-full"
          />

          {/* Heart Icon */}
          <button className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform"
            onClick={e => e.preventDefault()}>
            <Heart className="h-5 w-5 text-[#002f34]" />
          </button>

          {/* Distance Badge */}
          {distanceLabel && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#002f34] shadow-sm">
              <MapPin className="h-3 w-3 text-[#00a49f]" />
              {distanceLabel}
            </div>
          )}

          {/* Pickup Available tag */}
          <div className="absolute bottom-4 left-4 bg-[#002f34] text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm">
            Pickup Available
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffce32] to-transparent"></div>
        </div>

        <div className="p-3 flex flex-col flex-grow">
          <div className="font-bold text-[22px] text-[#002f34] mb-1">
            ₹ {product.price.toLocaleString('en-IN')}
          </div>

          <h3 className="text-sm text-[#406367] line-clamp-1 mb-2">
            {product.title}
          </h3>

          <div className="mt-auto flex justify-between items-end text-[11px] text-[#406367] uppercase">
            <span className="line-clamp-1 max-w-[70%] flex items-center gap-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {product.address}
            </span>
            <span className="whitespace-nowrap">{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
