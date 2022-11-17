import express from 'express';
import {
    loginHandler,
    logoutHandler,
    refreshAccessTokenHandler,
    registerUserHandler,
    verifyEmailHandler,
    testEmailHandler
} from '../controllers/auth.controller';

import {authenticateUser} from '../middlewares/authUser';
import {requireUser} from '../middlewares/requireUser';
import { validate } from '../middlewares/validate';
import { createUserSchema, loginUserSchema, verifyEmailSchema } from '../schemas/user.schema';

const router = express.Router();

router.post(
    '/register', 
    validate(createUserSchema),
    registerUserHandler
)


router.post(
    '/login', 
    validate(loginUserSchema), 
    loginHandler
);

router.get(
    '/logout',
    authenticateUser,
    requireUser,
    logoutHandler
)

router.get(
    '/refresh', 
    refreshAccessTokenHandler
);

router.get(
    '/verifyemail/:verificationCode',
    validate(verifyEmailSchema),
    verifyEmailHandler
)

router.post(
    '/testemail',
    testEmailHandler
)


export default router;