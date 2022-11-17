import { CookieOptions, NextFunction, Request, Response } from 'express';
import config from 'config';
import { CreateUserInput, LoginUserInput, VerifyEmailInput } from '../schemas/user.schema';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUser,
  signTokens,
} from '../services/user.services';
import AppError from '../utils/appError';
import redisClient from '../utils/connectRedis';
import { signJwt, verifyJwt } from '../utils/jwt';
import { User } from '../entities/user.entity';
import Email from '../utils/emails';


const cookiesOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax'
}

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true

const accessTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(
        Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000
    ),
    maxAge: config.get<number>('accessTokenExpiresIn')*60*1000
};

const refreshTokenCookieOptions: CookieOptions = {
    ...cookiesOptions,
    expires: new Date(
      Date.now() + config.get<number>('refreshTokenExpiresIn') * 60 * 1000
    ),
    maxAge: config.get<number>('refreshTokenExpiresIn') * 60 * 1000,
  };

export const registerUserHandler = async (
    req: Request<{},{}, CreateUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {name,password,email} = req.body;

        const user = await createUser({
            name,
            email:email.toLowerCase(),
            password
        });
        
        const {verificationCode, hashedVerificationCode} = User.createVeriificationCode();

        user.verificationCode = hashedVerificationCode

        await user.save();

        const redirectUrl = `${config.get<string>('origin')}/api/auth/verifyemail/${verificationCode}`
        console.log(redirectUrl)
        try {
            await new Email(user, redirectUrl).sendVerificationCode();
            res.status(201).json({
                status: 'success',
                message: 'An email with a verifitacion code has been sent.'
            });
        } catch(error) {
            user.verificationCode = null;
            await user.save();
            res.status(500).json({
                status: 'error',
                message: 'There was an error sending email, please try again.'
            });
        }
    } catch (error) {
        next(error);
    }  
}

export const loginHandler = async (
    req: Request<{},{}, LoginUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, password} = req.body;
        const user = await findUserByEmail(email)
        if (!user) {
            return next(new AppError(
                400, "01 invalid email or password"
            ))
        } else {
            if (!user.verified){
                return next(new AppError(
                    400, "02 invalid email or password"
                ))                
            }
            const passwordCheck = await User.comparePasswords(password, user.password)
            if (!passwordCheck){
                return next(new AppError(
                    400, "03 invalid email or password"
                ))
            }
        };

        const {access_token, refresh_token} = await signTokens(user);

        res.cookie('access_token', access_token, accessTokenCookieOptions);
        res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions)
        res.cookie('logged_in', true, {
            ...accessTokenCookieOptions,
            httpOnly: false
        });

        res.status(200).json({
            status:"success",
            access_token
        });

    } catch (error) {
        next(error);
    }
};


export const refreshAccessTokenHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const message = 'could not refresh access token';

        if (!refresh_token){
            return next(new AppError(
                403, message
            ))
        }

        const decoded = verifyJwt<{sub:string}>(
            refresh_token,
            'refreshTokenPublicKey'
        );
        if (!decoded){
            return next(new AppError(
                403, message
            ))
        }

        const session = await redisClient.get(decoded.sub)

        if (!session) {
            return next(new AppError(
                403, message
            ))
        }

        const user = await findUserById(
            JSON.parse(session).id
        );

        if (!user) {
            return next(new AppError(
                403, message
            ))
        }

        const access_token = signJwt({sub:user.id},
            'accessTokenPrivateKey', {
                expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`
            }
        );

        res.cookie('access_token', access_token, accessTokenCookieOptions);
        res.cookie('logged_in', true, {
            ...accessTokenCookieOptions,
            httpOnly: false
        })
        res.status(200).json({
            status:"success",
            access_token
        });
    } catch(error){
        next(error);
    }
}


const expireTokens = (res: Response) => {
    res.cookie('access_token', "", {maxAge:-1})
    res.cookie('refresh_token', "", {maxAge:-1})
    res.cookie('logged_in', "", {maxAge:-1})
}

export const logoutHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const user = res.locals.user;

        await redisClient.del(user.id);

        expireTokens(res)

        res.status(200).json({
            status:"success"
        })

    } catch (error) {
        next(error)
    }
}

import crypto from 'crypto'

export const verifyEmailHandler = async (
    req: Request<VerifyEmailInput>,
    res: Response,
    next: NextFunction     
) => {
    try {
        const verificationCode = crypto
            .createHash('sha256')
            .update(req.params.verificationCode)
            .digest('hex')

        const user = await findUser({verificationCode})

        if (!user){
            return next(new AppError(
                401, "could not verify email"
            ))
        };

        user.verified = true;
        user.verificationCode = null;
        await user.save();

        res.status(200).json({
            status:'success',
            message:'email verified successfully'
        })

    } catch(error) {
        next(error)
    }
}


export const getUserProfileHandler = async (
    req: Request,
    res: Response,
    next: NextFunction   
) => {
    try {
        const user = res.locals.user;
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });

    } catch(error) {
        next(error)
    }
}


export const testEmailHandler = async (
    req: Request,
    res: Response,
    next: NextFunction  
) => {
    try {
        const email = req.body.email
        const user = await findUserByEmail(email)
        if (user){
            await new Email(user, "").sentTestEmail();
            res.status(200).json({
                status: 'success',
                message: "email sent"
            });       
        } else{
            res.status(400).json({
                status: 'error',
                message: "user email not found"
            });               
        }
    } catch(error) {
        next(error)
    }

}