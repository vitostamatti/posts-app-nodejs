import express from 'express';
import { createPostHandler, deletePostHandler, getPostHandler, getPostsHandler, updatePostHandler } from '../controllers/post.controller';
import { authenticateUser } from '../middlewares/authUser';
import { requireUser } from '../middlewares/requireUser';
import { validate } from '../middlewares/validate';
import { createPostSchema, deletePostSchema, getPostSchema, updatePostSchema } from '../schemas/post.schema';


const router = express.Router()

router.use(
    authenticateUser, requireUser
);

router.route('/')
    .post(validate(createPostSchema), createPostHandler)
    .get(getPostsHandler);

router.route("/:id")
    .get(validate(getPostSchema), getPostHandler)
    .patch(validate(updatePostSchema), updatePostHandler)
    .delete(validate(deletePostSchema), deletePostHandler)

export default router