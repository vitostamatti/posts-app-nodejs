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
exports.deletePostHandler = exports.updatePostHandler = exports.getPostsHandler = exports.getPostHandler = exports.createPostHandler = void 0;
const post_services_1 = require("../services/post.services");
const user_services_1 = require("../services/user.services");
const appError_1 = __importDefault(require("../utils/appError"));
const createPostHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, user_services_1.findUserById)(res.locals.user.id);
        if (!user) {
            return next(new appError_1.default(404, "user not found"));
        }
        const post = yield (0, post_services_1.createPost)(req.body, user);
        res.status(201).json({
            status: 'success',
            data: {
                post
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createPostHandler = createPostHandler;
const getPostHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield (0, post_services_1.getPost)(parseInt(req.params.id));
        if (!post) {
            return next(new appError_1.default(404, "post not found"));
        }
        ;
        res.status(200).json({
            status: 'success',
            data: {
                post
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPostHandler = getPostHandler;
const getPostsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield (0, post_services_1.findPosts)({}, {}, {});
        res.status(200).json({
            status: 'success',
            data: {
                posts
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPostsHandler = getPostsHandler;
const updatePostHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield (0, post_services_1.getPost)(parseInt(req.params.id));
        if (!post) {
            return next(new appError_1.default(404, "post not found"));
        }
        ;
        Object.assign(post, req.body);
        const updatedPost = yield post.save();
        res.status(200).json({
            status: 'success',
            data: {
                updatedPost
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePostHandler = updatePostHandler;
const deletePostHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield (0, post_services_1.getPost)(parseInt(req.params.id));
        if (!post) {
            return next(new appError_1.default(404, 'post not found'));
        }
        yield post.remove();
        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deletePostHandler = deletePostHandler;
