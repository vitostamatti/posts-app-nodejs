import express from 'express';
import { getUserProfileHandler } from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/authUser';
import { requireUser } from '../middlewares/requireUser';

const router = express.Router();

router.use(
    authenticateUser,requireUser
)

router.get('/profile', getUserProfileHandler)

export default router;