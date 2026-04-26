'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CreditCard, Wallet, Truck, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [fulfillmentType, setFulfillmentType] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'COD'>('Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
    if (items.length === 0 && !success) router.push('/cart');
  }, [user, items, router, success]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePayWithRazorpay = async () => {
    if (fulfillmentType === 'Delivery' && !shippingAddress.trim()) {
      setError('Please enter a shipping address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. Get Razorpay key from backend
      const { data: keyData } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}/api/payment/key`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      // 2. Create a Razorpay order on backend
      const { data: orderData } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}/api/payment/create-order`, {
        amount: getTotal()
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      // 3. Open Razorpay modal
      const options = {
        key: keyData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SecondHand Marketplace',
        description: `Order for ${items.length} item(s)`,
        order_id: orderData.id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#002f34' },
        handler: async (response: any) => {
          // 4. Verify payment on backend and create DB order
          try {
            const orderItems = items.map(item => ({
              product: item.product,
              seller: item.seller,
              price: item.price,
              title: item.title
            }));

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems,
              shippingAddress,
              fulfillmentType,
              paymentMethod: 'Card',
              totalAmount: getTotal(),
            }, {
              headers: { Authorization: `Bearer ${user?.token}` }
            });

            setSuccess(true);
            clearCart();
          } catch (err) {
            setError('Payment verified but order creation failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    if (!shippingAddress.trim() && fulfillmentType === 'Delivery') {
      setError('Please enter a shipping address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        product: item.product,
        seller: item.seller,
        price: item.price,
        title: item.title
      }));
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://secondhand-product-marketplace.onrender.com'}/api/orders`, {
        orderItems,
        shippingAddress: fulfillmentType === 'Pickup' ? 'Self Pickup' : shippingAddress,
        fulfillmentType,
        paymentMethod: 'COD',
        totalAmount: getTotal(),
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 border border-gray-200 rounded-xl bg-gray-50">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#002f34] mb-4">Order Confirmed!</h1>
          <p className="text-[#406367] mb-2">Your payment was successful.</p>
          <p className="text-[#406367] mb-8 text-sm">
            {fulfillmentType === 'Pickup'
              ? 'The seller will contact you to arrange pickup.'
              : 'Your items will be delivered to your address.'}
          </p>
          <Link href="/profile" className="inline-block bg-[#002f34] hover:bg-[#00a49f] text-white font-bold py-3 px-6 rounded transition-colors mr-3">
            View Orders
          </Link>
          <Link href="/" className="inline-block border-2 border-[#002f34] text-[#002f34] hover:bg-[#002f34] hover:text-white font-bold py-3 px-6 rounded transition-colors">
            Keep Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f2f4f5] min-h-screen text-[#002f34]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-green-600" />
          <h1 className="text-2xl font-bold text-[#002f34]">Secure Checkout</h1>
          <ShieldCheck className="h-5 w-5 text-green-600 ml-1" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded border border-red-200 font-medium text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Form ── */}
          <div className="flex-1 space-y-5">

            {/* Step 1 — Fulfillment */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-[#002f34]">
                <span className="h-6 w-6 bg-white text-[#002f34] rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <h2 className="font-bold text-white text-sm uppercase tracking-widest">How do you want to get it?</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${fulfillmentType === 'Delivery' ? 'border-[#002f34] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="fulfillment" className="sr-only" checked={fulfillmentType === 'Delivery'} onChange={() => setFulfillmentType('Delivery')} />
                    <span className="text-3xl">🚚</span>
                    <div className="text-center">
                      <div className="font-bold text-[#002f34] text-sm">Home Delivery</div>
                      <div className="text-xs text-[#406367]">Delivered to your door</div>
                    </div>
                  </label>
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${fulfillmentType === 'Pickup' ? 'border-[#002f34] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="fulfillment" className="sr-only" checked={fulfillmentType === 'Pickup'} onChange={() => setFulfillmentType('Pickup')} />
                    <span className="text-3xl">🤝</span>
                    <div className="text-center">
                      <div className="font-bold text-[#002f34] text-sm">Self Pickup</div>
                      <div className="text-xs text-[#406367]">Meet seller locally</div>
                    </div>
                  </label>
                </div>
                {fulfillmentType === 'Pickup' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                    ✅ The seller will contact you to arrange the meetup.
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — Shipping Address (only if Delivery) */}
            {fulfillmentType === 'Delivery' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 bg-[#406367]">
                  <span className="h-6 w-6 bg-white text-[#406367] rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <h2 className="font-bold text-white text-sm uppercase tracking-widest">Delivery Address</h2>
                </div>
                <div className="p-6">
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#002f34] text-[#002f34] text-sm"
                    placeholder="Enter your complete delivery address..."
                  />
                </div>
              </div>
            )}

            {/* Step 3 — Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-[#00a49f]">
                <span className="h-6 w-6 bg-white text-[#00a49f] rounded-full flex items-center justify-center text-sm font-bold">
                  {fulfillmentType === 'Pickup' ? '2' : '3'}
                </span>
                <h2 className="font-bold text-white text-sm uppercase tracking-widest">Payment Method</h2>
              </div>
              <div className="p-6 space-y-3">

                {/* Razorpay — Card/UPI */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Card' ? 'border-[#002f34] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" className="mr-3 accent-[#002f34]" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} />
                  <CreditCard className={`h-5 w-5 mr-3 ${paymentMethod === 'Card' ? 'text-[#002f34]' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-bold text-[#002f34] text-sm">Pay Online via Razorpay</div>
                    <div className="text-xs text-[#406367]">Credit/Debit Card, UPI, Net Banking, Wallets</div>
                  </div>
                  <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="h-6 w-6 ml-2" />
                </label>

                {/* UPI */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'UPI' ? 'border-[#002f34] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" className="mr-3 accent-[#002f34]" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                  <Wallet className={`h-5 w-5 mr-3 ${paymentMethod === 'UPI' ? 'text-[#002f34]' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-bold text-[#002f34] text-sm">UPI (GPay, PhonePe, Paytm)</div>
                    <div className="text-xs text-[#406367]">Powered by Razorpay</div>
                  </div>
                </label>

                {/* COD */}
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-[#002f34] bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" className="mr-3 accent-[#002f34]" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                  <Truck className={`h-5 w-5 mr-3 ${paymentMethod === 'COD' ? 'text-[#002f34]' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-bold text-[#002f34] text-sm">Cash on Delivery / Pickup</div>
                    <div className="text-xs text-[#406367]">Pay when you receive</div>
                  </div>
                </label>

              </div>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-xl text-[#002f34] mb-5">Order Summary</h3>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.product} className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#002f34] truncate">{item.title}</p>
                    </div>
                    <span className="font-bold text-[#002f34] text-sm">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-[#406367]">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-[#406367]">
                  <span>Delivery</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                <div className="flex justify-between font-extrabold text-xl text-[#002f34] pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Pay Button */}
              {paymentMethod === 'COD' ? (
                <button
                  onClick={handleCOD}
                  disabled={loading}
                  className="w-full bg-[#002f34] hover:bg-[#00a49f] text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-70 text-base"
                >
                  {loading ? 'Placing Order...' : '📦 Place COD Order'}
                </button>
              ) : (
                <button
                  onClick={handlePayWithRazorpay}
                  disabled={loading}
                  className="w-full bg-[#002f34] hover:bg-[#00a49f] text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-70 text-base flex items-center justify-center gap-2"
                >
                  {loading ? 'Opening Payment...' : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ₹{getTotal().toLocaleString('en-IN')} via Razorpay
                    </>
                  )}
                </button>
              )}

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Secured by Razorpay · 256-bit SSL
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
