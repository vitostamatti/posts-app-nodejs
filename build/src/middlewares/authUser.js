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
exports.authenticateUser = void 0;
const user_services_1 = require("../services/user.services");
const appError_1 = __importDefault(require("../utils/appError"));
const connectRedis_1 = __importDefault(require("../utils/connectRedis"));
const jwt_1 = require("../utils/jwt");
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let access_token = null;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            access_token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies.access_token) {
            access_token = req.cookies.access_token;
        }
        if (!access_token) {
            return next(new appError_1.default(401, "you are not logged in"));
        }
        const decoded = (0, jwt_1.verifyJwt)(access_token, 'accessTokenPublicKey');
        if (!decoded) {
            return next(new appError_1.default(401, "invalid token or user does not exists"));
        }
        const session = yield connectRedis_1.default.get(decoded.sub);
        if (!session) {
            return next(new appError_1.default(401, "invalid token or user does not exists"));
        }
        const user = yield (0, user_services_1.findUserById)(JSON.parse(session).id);
        if (!user) {
            return next(new appError_1.default(401, "invalid token or user does not exists"));
        }
        res.locals.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.authenticateUser = authenticateUser;
