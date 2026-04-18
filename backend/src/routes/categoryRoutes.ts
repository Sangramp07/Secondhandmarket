import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect as any, admin as any, createCategory as any);

router.route('/:id')
  .delete(protect as any, admin as any, deleteCategory as any);

export default router;
