import {
    Request,
    Response,
    NextFunction
} from 'express';

import {
    CreatePostInput,
    DeletePostInput,
    GetPostInput,
    UpdatePostInput
} from '../schemas/post.schema';

import {
    createPost,
    findPosts,
    getPost
} from '../services/post.services';

import {
    findUserById
} from '../services/user.services';

import AppError from '../utils/appError';



export const createPostHandler = async (
    req: Request<{}, {}, CreatePostInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await findUserById(
            res.locals.user.id
        )
        if (!user){
            return next(new AppError(
                404, "user not found"
            ))          
        }

        const post = await createPost(req.body, user)

        res.status(201).json({
            status: 'success',
            data: {
                post
            }
        });

    } catch(error){
        next(error)
    }
}

export const getPostHandler = async (
    req: Request<GetPostInput>,
    res: Response,
    next: NextFunction    
) => {
    try {
        const post = await getPost(
            parseInt(req.params.id)
        )
        
        if (!post){
            return next(new AppError(
                404,"post not found"
            ))
        };

        res.status(200).json({
            status: 'success',
            data: {
                post
            }
        })

    } catch(error) {
        next(error)
    }
}

export const getPostsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {  
        const posts = await findPosts({},{},{})

        res.status(200).json({
            status: 'success',
            data: {
                posts
            }
        });

    } catch(error) {
        next(error)
    }
};

export const updatePostHandler = async (
    req:Request<UpdatePostInput['params'],{},UpdatePostInput['body']>,
    res:Response,
    next:NextFunction
) => {
    try {
        const post = await getPost(parseInt(req.params.id));

        if (!post){
            return next(new AppError(
                404,"post not found"
            ))
        };

        Object.assign(post, req.body)

        const updatedPost = await post.save();

        res.status(200).json({
            status:'success',
            data: {
                updatedPost
            }
        })

    } catch(error) {
        next(error)
    }
}

export const deletePostHandler = async (
    req: Request<DeletePostInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const post = await getPost(parseInt(req.params.id))

        if (!post) {
            return next(new AppError(
                404,'post not found'
            ))
        }
        await post.remove();

        res.status(204).json({
            status: 'success',
            data: post
        })
    } catch(error) {
        next(error)
    }
}