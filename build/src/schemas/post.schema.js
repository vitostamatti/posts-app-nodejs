"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePostSchema = exports.updatePostSchema = exports.getPostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = (0, zod_1.object)({
    body: (0, zod_1.object)({
        title: (0, zod_1.string)({
            required_error: 'title is required'
        }),
        content: (0, zod_1.string)({
            required_error: 'content is required'
        }),
    })
});
const params = {
    params: (0, zod_1.object)({
        id: (0, zod_1.string)()
    })
};
exports.getPostSchema = (0, zod_1.object)(Object.assign({}, params));
exports.updatePostSchema = (0, zod_1.object)(Object.assign(Object.assign({}, params), { body: (0, zod_1.object)({
        title: (0, zod_1.string)(),
        content: (0, zod_1.string)()
    }).partial() }));
exports.deletePostSchema = (0, zod_1.object)(Object.assign({}, params));
