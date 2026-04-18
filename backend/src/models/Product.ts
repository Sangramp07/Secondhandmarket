import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  condition: 'New' | 'Like New' | 'Used';
  images: string[];
  seller: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  address: string;
  status: 'Available' | 'Sold' | 'Pending';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    condition: { type: String, enum: ['New', 'Like New', 'Used'], required: true },
    images: [{ type: String }],
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: { type: String, required: true },
    status: { type: String, enum: ['Available', 'Sold', 'Pending'], default: 'Available' },
  },
  { timestamps: true }
);

// Create Geospatial Index for nearby products search
ProductSchema.index({ location: '2dsphere' });

export default mongoose.model<IProduct>('Product', ProductSchema);
