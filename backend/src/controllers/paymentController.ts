import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middlewares/authMiddleware';

// Lazy getter so Razorpay reads env vars AFTER dotenv.config() runs
const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { amount } = req.body; // amount in rupees

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await getRazorpay().orders.create(options);

    res.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

// @desc    Verify Razorpay payment & create order in DB
// @route   POST /api/payment/verify
// @access  Private
export const verifyAndCreateOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      shippingAddress,
      fulfillmentType,
      paymentMethod,
      totalAmount,
    } = req.body;

    // Verify the payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Signature valid — create order in DB
    const order = new Order({
      buyer: req.user?._id,
      orderItems,
      shippingAddress: fulfillmentType === 'Pickup' ? 'Self Pickup' : shippingAddress,
      fulfillmentType,
      paymentMethod,
      totalAmount,
      paymentStatus: 'Completed',
      transactionId: razorpay_payment_id,
    });

    await order.save();

    // Mark all purchased products as Sold
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { status: 'Sold' });
    }

    res.status(201).json({ message: 'Payment successful', orderId: order._id });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
};

// @desc    Get Razorpay key (public)
// @route   GET /api/payment/key
// @access  Private
export const getRazorpayKey = async (req: AuthRequest, res: Response): Promise<any> => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};
