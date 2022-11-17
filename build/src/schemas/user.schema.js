"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.loginUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const user_entity_1 = require("../entities/user.entity");
exports.createUserSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        name: (0, zod_1.string)({
            required_error: "name is required",
        }),
        email: (0, zod_1.string)({
            required_error: 'email address is required',
        }).email("invalid email address"),
        password: (0, zod_1.string)({
            required_error: "password is requires"
        }).min(8, 'password must be more than 8 characters')
            .max(32, 'password must be less than 32 characters'),
        passwordConfirm: (0, zod_1.string)({
            required_error: "please confirm your password"
        }),
        role: zod_1.z.optional(zod_1.z.nativeEnum(user_entity_1.RoleType))
    }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: "passwords do not match"
    })
});
exports.loginUserSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        email: (0, zod_1.string)({
            required_error: "email address is required"
        }).email('invalid email address'),
        password: (0, zod_1.string)({
            required_error: 'password is required'
        })
            .min(8, 'invalid email or password')
    })
});
exports.verifyEmailSchema = (0, zod_1.object)({
    params: (0, zod_1.object)({
        verificationCode: (0, zod_1.string)()
    })
});
