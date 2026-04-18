import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category';

dotenv.config();

const categories = [
  'Mobile Phones',
  'Laptops',
  'Furniture',
  'Books',
  'Bikes',
  'Electronics',
  'Clothes',
  'Home Appliances'
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');

    for (const name of categories) {
      const exists = await Category.findOne({ name });
      if (!exists) {
        await Category.create({ name });
      }
    }

    console.log('Categories Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
