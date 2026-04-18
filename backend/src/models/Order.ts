import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  orderItems: {
    product: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    price: number;
    title: string;
  }[];
  totalAmount: number;
  fulfillmentType: 'Pickup' | 'Delivery';
  paymentMethod: 'UPI' | 'Card' | 'COD';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  transactionId?: string; // from payment gateway
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  title: { type: String, required: true }
});

const OrderSchema: Schema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    fulfillmentType: { type: String, enum: ['Pickup', 'Delivery'], default: 'Delivery' },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'COD'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
    orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },
    shippingAddress: { type: String, required: true },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
