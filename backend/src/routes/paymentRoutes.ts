import express from 'express';
import { createRazorpayOrder, verifyAndCreateOrder, getRazorpayKey } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/key', protect as any, getRazorpayKey as any);
router.post('/create-order', protect as any, createRazorpayOrder as any);
router.post('/verify', protect as any, verifyAndCreateOrder as any);

export default router;
