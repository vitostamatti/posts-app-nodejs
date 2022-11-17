import {object, string, TypeOf, z }from 'zod';
import { RoleType } from '../entities/user.entity';

export const createUserSchema = object({
    body: object({
        name:string({
            required_error:"name is required",
        }),
        email: string({
            required_error:'email address is required',
        }).email("invalid email address"),
        password: string({
            required_error:"password is requires"
        }).min(8, 'password must be more than 8 characters')
        .max(32, 'password must be less than 32 characters'),
        
        passwordConfirm: string({
            required_error: "please confirm your password"
        }),
        role: z.optional(z.nativeEnum(RoleType))
    }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message:"passwords do not match"
    })
});

export const loginUserSchema = object({
    body: object({
        email: string({
            required_error: "email address is required"
        }).email('invalid email address'),
        password: string({
            required_error:'password is required'
        })
        .min(8, 'invalid email or password')
    })
})



export type CreateUserInput = Omit<
    TypeOf<typeof createUserSchema>['body'],
    'passwordConfirm'
>;

export type LoginUserInput = TypeOf<
    typeof loginUserSchema
>['body'];


export const verifyEmailSchema = object({
    params: object({
        verificationCode: string()
    })
})

export type VerifyEmailInput = TypeOf<
    typeof verifyEmailSchema
>['params']