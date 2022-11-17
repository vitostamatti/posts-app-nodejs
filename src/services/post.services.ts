import config from "config";
import { User } from "../entities/user.entity";
import { Post } from '../entities/post.entity';
import redisClient from "../utils/connectRedis";
import { AppDataSource } from "../utils/data-source";
import {
    FindOptionsRelations,
    FindOptionsSelect,
    FindOptionsWhere
} from 'typeorm'


const postRepository = AppDataSource.getRepository(Post);

export const createPost = async(input: Partial<Post>, user: User) => {
    return await postRepository.save(
        postRepository.create({...input, user})
    )
};

export const getPost = async (id:number) => {
    return await postRepository.findOneBy({id})
};

export const findPosts = async (
    where: FindOptionsWhere<Post> = {},
    select: FindOptionsSelect<Post> = {},
    relations: FindOptionsRelations<Post> = {}
) => {
    return await postRepository.find({
        where,
        select,
        relations
    });
};

