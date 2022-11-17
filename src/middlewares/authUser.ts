import { Request, Response, NextFunction} from 'express';
import { findUserById } from '../services/user.services';
import AppError from '../utils/appError';
import redisClient from '../utils/connectRedis';
import { verifyJwt } from '../utils/jwt';


export const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let access_token:string | null = null

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ){
            access_token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.access_token) {
            access_token = req.cookies.access_token;
        }

        if (!access_token){
            return next(new AppError(
                401,"you are not logged in"
            ));
        }

        const decoded = verifyJwt<{sub: string}>(
            access_token,
            'accessTokenPublicKey'
        );

        if (!decoded){
            return next(new AppError(
                401,"invalid token or user does not exists"
            ));
        }

        const session = await redisClient.get(decoded.sub);

        if (!session){
            return next(new AppError(
                401,"invalid token or user does not exists"
            ));         
        }

        const user = await findUserById(
            JSON.parse(session).id
        );

        if (!user){
            return next(new AppError(
                401,"invalid token or user does not exists"
            ));         
        }
        
        res.locals.user = user;

        next();

    } catch(error) {
        next(error)
    }
}