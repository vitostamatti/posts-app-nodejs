"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailHandler = exports.getUserProfileHandler = exports.verifyEmailHandler = exports.logoutHandler = exports.refreshAccessTokenHandler = exports.loginHandler = exports.registerUserHandler = void 0;
const config_1 = __importDefault(require("config"));
const user_services_1 = require("../services/user.services");
const appError_1 = __importDefault(require("../utils/appError"));
const connectRedis_1 = __importDefault(require("../utils/connectRedis"));
const jwt_1 = require("../utils/jwt");
const user_entity_1 = require("../entities/user.entity");
const emails_1 = __importDefault(require("../utils/emails"));
const cookiesOptions = {
    httpOnly: true,
    sameSite: 'lax'
};
if (process.env.NODE_ENV === 'production')
    cookiesOptions.secure = true;
const accessTokenCookieOptions = Object.assign(Object.assign({}, cookiesOptions), { expires: new Date(Date.now() + config_1.default.get('accessTokenExpiresIn') * 60 * 1000), maxAge: config_1.default.get('accessTokenExpiresIn') * 60 * 1000 });
const refreshTokenCookieOptions = Object.assign(Object.assign({}, cookiesOptions), { expires: new Date(Date.now() + config_1.default.get('refreshTokenExpiresIn') * 60 * 1000), maxAge: config_1.default.get('refreshTokenExpiresIn') * 60 * 1000 });
const registerUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password, email } = req.body;
        const user = yield (0, user_services_1.createUser)({
            name,
            email: email.toLowerCase(),
            password
        });
        const { verificationCode, hashedVerificationCode } = user_entity_1.User.createVeriificationCode();
        user.verificationCode = hashedVerificationCode;
        yield user.save();
        const redirectUrl = `${config_1.default.get('origin')}/api/auth/verifyemail/${verificationCode}`;
        console.log(redirectUrl);
        try {
            yield new emails_1.default(user, redirectUrl).sendVerificationCode();
            res.status(201).json({
                status: 'success',
                message: 'An email with a verifitacion code has been sent.'
            });
        }
        catch (error) {
            user.verificationCode = null;
            yield user.save();
            res.status(500).json({
                status: 'error',
                message: 'There was an error sending email, please try again.'
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.registerUserHandler = registerUserHandler;
const loginHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield (0, user_services_1.findUserByEmail)(email);
        if (!user) {
            return next(new appError_1.default(400, "01 invalid email or password"));
        }
        else {
            if (!user.verified) {
                return next(new appError_1.default(400, "02 invalid email or password"));
            }
            const passwordCheck = yield user_entity_1.User.comparePasswords(password, user.password);
            if (!passwordCheck) {
                return next(new appError_1.default(400, "03 invalid email or password"));
            }
        }
        ;
        const { access_token, refresh_token } = yield (0, user_services_1.signTokens)(user);
        res.cookie('access_token', access_token, accessTokenCookieOptions);
        res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
        res.cookie('logged_in', true, Object.assign(Object.assign({}, accessTokenCookieOptions), { httpOnly: false }));
        res.status(200).json({
            status: "success",
            access_token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.loginHandler = loginHandler;
const refreshAccessTokenHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh_token = req.cookies.refresh_token;
        const message = 'could not refresh access token';
        if (!refresh_token) {
            return next(new appError_1.default(403, message));
        }
        const decoded = (0, jwt_1.verifyJwt)(refresh_token, 'refreshTokenPublicKey');
        if (!decoded) {
            return next(new appError_1.default(403, message));
        }
        const session = yield connectRedis_1.default.get(decoded.sub);
        if (!session) {
            return next(new appError_1.default(403, message));
        }
        const user = yield (0, user_services_1.findUserById)(JSON.parse(session).id);
        if (!user) {
            return next(new appError_1.default(403, message));
        }
        const access_token = (0, jwt_1.signJwt)({ sub: user.id }, 'accessTokenPrivateKey', {
            expiresIn: `${config_1.default.get('accessTokenExpiresIn')}m`
        });
        res.cookie('access_token', access_token, accessTokenCookieOptions);
        res.cookie('logged_in', true, Object.assign(Object.assign({}, accessTokenCookieOptions), { httpOnly: false }));
        res.status(200).json({
            status: "success",
            access_token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshAccessTokenHandler = refreshAccessTokenHandler;
const expireTokens = (res) => {
    res.cookie('access_token', "", { maxAge: -1 });
    res.cookie('refresh_token', "", { maxAge: -1 });
    res.cookie('logged_in', "", { maxAge: -1 });
};
const logoutHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = res.locals.user;
        yield connectRedis_1.default.del(user.id);
        expireTokens(res);
        res.status(200).json({
            status: "success"
        });
    }
    catch (error) {
        next(error);
    }
});
exports.logoutHandler = logoutHandler;
const crypto_1 = __importDefault(require("crypto"));
const verifyEmailHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verificationCode = crypto_1.default
            .createHash('sha256')
            .update(req.params.verificationCode)
            .digest('hex');
        const user = yield (0, user_services_1.findUser)({ verificationCode });
        if (!user) {
            return next(new appError_1.default(401, "could not verify email"));
        }
        ;
        user.verified = true;
        user.verificationCode = null;
        yield user.save();
        res.status(200).json({
            status: 'success',
            message: 'email verified successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyEmailHandler = verifyEmailHandler;
const getUserProfileHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = res.locals.user;
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserProfileHandler = getUserProfileHandler;
const testEmailHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const user = yield (0, user_services_1.findUserByEmail)(email);
        if (user) {
            yield new emails_1.default(user, "").sentTestEmail();
            res.status(200).json({
                status: 'success',
                message: "email sent"
            });
        }
        else {
            res.status(400).json({
                status: 'error',
                message: "user email not found"
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.testEmailHandler = testEmailHandler;
