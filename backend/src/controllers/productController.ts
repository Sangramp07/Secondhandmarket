import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Fetch all products (with optional search, category, and location filter)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = req.query.keyword as string || '';
    const { lng, lat, radius, category: catId, categoryName } = req.query as Record<string, string>;

    let categoryFilter: any = {};
    if (catId) {
      categoryFilter = { category: catId };
    } else if (categoryName) {
      const categoryDoc = await Category.findOne({ name: categoryName });
      if (categoryDoc) categoryFilter = { category: categoryDoc._id };
    }

    // If user coordinates provided, use $geoNear to sort by distance (no hard filter)
    if (lng && lat) {
      const pipeline: any[] = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: 'distanceMeters',
            spherical: true,
            // No maxDistance — show ALL products but sorted by distance
          },
        },
        { $match: { status: 'Available', ...(keyword ? { title: { $regex: keyword, $options: 'i' } } : {}), ...categoryFilter } },
        { $sort: { distanceMeters: 1 } },
        // Populate category
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmpty: true } },
        // Populate seller
        { $lookup: { from: 'users', localField: 'seller', foreignField: '_id', as: 'seller' } },
        { $unwind: { path: '$seller', preserveNullAndEmpty: true } },
        // Add distanceKm field — only for products that have real coordinates (not [0,0])
        {
          $addFields: {
            distanceKm: {
              $cond: [
                { $gt: ['$distanceMeters', 100000] }, // > 100km likely means [0,0] fallback
                null,
                { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] }
              ]
            }
          }
        },
        { $project: { 'seller.password': 0, 'seller.location': 0 } },
      ];

      const result = await (Product as any).aggregate(pipeline);
      res.json(result);
      return;
    }

    // No coordinates — regular query
    const keywordFilter = keyword ? { title: { $regex: keyword, $options: 'i' } } : {};
    const products = await Product.find({ ...keywordFilter, ...categoryFilter, status: 'Available' })
      .populate('category', 'name')
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: (error as Error).message });
  }
};

// @desc    Fetch products listed by the logged in user
// @route   GET /api/products/myproducts
// @access  Private
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ seller: req.user?._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('seller', 'name email phone');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, category, condition, address, coordinates } = req.body;
    
    // Use provided coordinates, or fall back to the seller's saved location
    let productCoordinates = [0, 0];
    if (coordinates) {
      productCoordinates = JSON.parse(coordinates);
    } else if (req.user?._id) {
      const seller = await (await import('../models/User')).default.findById(req.user._id).select('location');
      if (seller?.location?.coordinates && 
          !(seller.location.coordinates[0] === 0 && seller.location.coordinates[1] === 0)) {
        productCoordinates = seller.location.coordinates;
      }
    }

    // Process uploaded images — Cloudinary returns full URL in file.path
    let images: string[] = [];
    if (req.files) {
      images = (req.files as Express.Multer.File[]).map((file) => (file as any).path);
    }

    const product = new Product({
      title,
      description,
      price,
      category,
      condition,
      address,
      seller: req.user?._id,
      images,
      location: {
        type: 'Point',
        coordinates: productCoordinates,
      },
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: (error as Error).message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, category, condition, address, status, coordinates } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user is the seller or an admin
      if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
        res.status(403).json({ message: 'User not authorized to update this product' });
        return;
      }

      product.title = title || product.title;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.condition = condition || product.condition;
      product.address = address || product.address;
      product.status = status || product.status;
      
      if (coordinates) {
         product.location.coordinates = JSON.parse(coordinates);
      }

      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const newImages = (req.files as Express.Multer.File[]).map((file) => (file as any).path);
        product.images = [...product.images, ...newImages];
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: (error as Error).message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
       // Check if user is the seller or an admin
       if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
        res.status(403).json({ message: 'User not authorized to delete this product' });
        return;
      }

      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
