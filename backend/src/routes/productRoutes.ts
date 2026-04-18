import express from 'express';
import {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect as any, upload.array('images', 5), createProduct as any);

// Must come before /:id to avoid route conflict
router.get('/myproducts', protect as any, getMyProducts as any);

router.route('/:id')
  .get(getProductById)
  .put(protect as any, upload.array('images', 5), updateProduct as any)
  .delete(protect as any, deleteProduct as any);

export default router;
