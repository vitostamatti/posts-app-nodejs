import {number, object, string, TypeOf, z }from 'zod';

export const createPostSchema = object({
    body: object({
        title: string({
            required_error: 'title is required'
        }),
        content: string({
            required_error: 'content is required'
        }),
    })
});

const params = {
    params: object({
        id: string()
    })
}

export const getPostSchema = object({
    ...params
})

export const updatePostSchema = object({
    ...params,
    body: object({
        title: string(),
        content: string()
    }).partial()
})

export const deletePostSchema = object({
    ...params,
})

// Types

export type CreatePostInput = TypeOf<typeof createPostSchema>['body'];
export type GetPostInput = TypeOf<typeof getPostSchema>['params'];
export type UpdatePostInput = TypeOf<typeof updatePostSchema>;
export type DeletePostInput = TypeOf<typeof deletePostSchema>['params']