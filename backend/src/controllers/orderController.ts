import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify products are still available and calculate total
    let totalAmount = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.status !== 'Available') {
        return res.status(400).json({ message: `Product ${product.title} is no longer available` });
      }
      totalAmount += product.price;
    }

    const order = new Order({
      buyer: req.user?._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed', // Mocking payment completion for card/upi
      transactionId: paymentMethod !== 'COD' ? `txn_${Math.random().toString(36).substr(2, 9)}` : undefined,
    });

    const createdOrder = await order.save();

    // Update product statuses to "Sold"
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { status: 'Sold' });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const orders = await Order.find({ buyer: req.user?._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders', error);
    res.status(500).json({ message: 'Server error' });
  }
};
