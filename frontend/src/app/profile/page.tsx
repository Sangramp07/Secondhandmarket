'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { MapPin, User as UserIcon, Package, Clock, Trash2, LogOut } from 'lucide-react';

type Tab = 'profile' | 'products' | 'orders';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<number[] | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // My Products state
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchProfile();
    }
  }, [user, router]);

  useEffect(() => {
    if (activeTab === 'products') fetchMyProducts();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setName(data.name || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
      if (data.location?.coordinates) setCoordinates(data.location.coordinates);
    } catch (error) {
      console.error('Error fetching profile', error);
    }
  };

  const fetchMyProducts = async () => {
    setProductsLoading(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/myproducts`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setMyProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setMyProducts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    try {
      const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        name, phone, address, coordinates,
      }, { headers: { Authorization: `Bearer ${user?.token}` } });
      setUser(data);
      setProfileMessage('Profile updated successfully!');
    } catch (error) {
      setProfileMessage('Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoordinates([pos.coords.longitude, pos.coords.latitude]),
        (err) => console.error(err)
      );
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const tabs = [
    { key: 'profile' as Tab, label: 'Profile Settings', icon: UserIcon },
    { key: 'products' as Tab, label: 'My Products', icon: Package },
    { key: 'orders' as Tab, label: 'Order History', icon: Clock },
  ];

  return (
    <div className="bg-white min-h-screen text-[#002f34]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#002f34]">My Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-60 flex-shrink-0">
            <div className="border border-gray-200 rounded overflow-hidden">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors border-b border-gray-200 last:border-b-0 ${
                    activeTab === key
                      ? 'bg-[#002f34] text-white'
                      : 'bg-white text-[#002f34] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">

            {/* ---- PROFILE TAB ---- */}
            {activeTab === 'profile' && (
              <div className="border border-gray-200 rounded p-6">
                <h2 className="text-xl font-bold text-[#002f34] mb-6">Profile Settings</h2>
                {profileMessage && (
                  <div className={`p-3 rounded mb-6 text-sm font-medium ${profileMessage.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {profileMessage}
                  </div>
                )}
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-bold text-[#002f34] mb-1">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-[#00a49f] text-[#002f34]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#002f34] mb-1">Email</label>
                      <input type="email" value={user.email} disabled
                        className="block w-full px-4 py-3 border border-gray-200 rounded bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#002f34] mb-1">Phone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-[#00a49f] text-[#002f34]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#002f34] mb-1">Address</label>
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                        className="block w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-[#00a49f] text-[#002f34]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#002f34] mb-2">Location</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded text-sm text-[#406367]">
                        {coordinates ? `Lng: ${coordinates[0].toFixed(4)}, Lat: ${coordinates[1].toFixed(4)}` : 'No location set'}
                      </div>
                      <button type="button" onClick={getLocation}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-[#002f34] rounded text-sm font-bold text-[#002f34] hover:bg-[#002f34] hover:text-white transition-colors">
                        <MapPin className="h-4 w-4" />
                        Update
                      </button>
                    </div>
                  </div>
                  <div>
                    <button type="submit" disabled={profileLoading}
                      className="px-8 py-3 bg-[#002f34] hover:bg-[#00a49f] text-white font-bold rounded transition-colors disabled:opacity-70">
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ---- MY PRODUCTS TAB ---- */}
            {activeTab === 'products' && (
              <div className="border border-gray-200 rounded p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#002f34]">My Products ({myProducts.length})</h2>
                  <Link href="/add-product"
                    className="bg-[#002f34] hover:bg-[#00a49f] text-white font-bold px-4 py-2 rounded text-sm transition-colors">
                    + Add New
                  </Link>
                </div>
                {productsLoading ? (
                  <div className="text-center py-12 text-[#406367]">Loading your products...</div>
                ) : myProducts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#406367] font-medium">You haven't listed any products yet.</p>
                    <Link href="/add-product" className="inline-block mt-4 text-sm font-bold text-[#002f34] underline">
                      Post your first ad →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {myProducts.map(product => (
                      <div key={product._id} className="flex items-center gap-4 py-4">
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {product.images?.[0]
                            ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`} alt={product.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#002f34] truncate">{product.title}</p>
                          <p className="text-sm text-[#406367]">₹{product.price?.toLocaleString('en-IN')} · {product.status}</p>
                          <p className="text-xs text-gray-400">{new Date(product.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${product._id}`}
                            className="text-sm font-bold text-[#002f34] border border-[#002f34] px-3 py-1.5 rounded hover:bg-[#002f34] hover:text-white transition-colors">
                            View
                          </Link>
                          <button onClick={() => handleDeleteProduct(product._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---- ORDER HISTORY TAB ---- */}
            {activeTab === 'orders' && (
              <div className="border border-gray-200 rounded p-6">
                <h2 className="text-xl font-bold text-[#002f34] mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="text-center py-12 text-[#406367]">Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-300 rounded">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#406367] font-medium">No orders yet.</p>
                    <Link href="/" className="inline-block mt-4 text-sm font-bold text-[#002f34] underline">
                      Browse products →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="border border-gray-200 rounded p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-400 font-mono">Order #{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-[#406367]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          {order.orderItems?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-[#406367] truncate mr-4">{item.title}</span>
                              <span className="font-bold text-[#002f34]">₹{item.price?.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                          <div className="flex items-center gap-3 text-xs text-[#406367]">
                            <span className="font-bold">{order.paymentMethod}</span>
                            <span>·</span>
                            <span>{order.shippingAddress}</span>
                          </div>
                          <span className="font-bold text-lg text-[#002f34]">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
