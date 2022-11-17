import config from "config";
import { User } from "../entities/user.entity";
import redisClient from "../utils/connectRedis";
import { AppDataSource } from "../utils/data-source";
import { signJwt } from "../utils/jwt";
import {
    DeepPartial
} from 'typeorm'

const userRepository = AppDataSource.getRepository(User);

// export const createUser = async (input: CreateUserInput) => {
//     if ( !findUserByEmail(input.email ) ){
//         let user = await AppDataSource.manager.create(User, input)
//         return AppDataSource.manager.save(user) as User
//         return (
//             await AppDataSource.manager.save(
//                     AppDataSource.manager.create(User, input)
//                 )
//             ) as User;
//     } else {
//         return new AppError(400, "email already exists");
//     }
// };

// alternative
export const createUser = async (input: DeepPartial<User>) => {
    return userRepository.save(userRepository.create(input));
  };

export const findUserByEmail = async (email: string)=>{
    return await userRepository.findOneBy({email});
}


export const findUserById = async (id:number) => {
    return await userRepository.findOneBy({id});
}


export const findUser = async (query: Object) => {
    return await userRepository.findOneBy(query)
}


export const signTokens = async (user: User) => {
    
    redisClient.set(user.id.toString(), JSON.stringify(user),{
        EX: config.get<number>('redisCacheExpiresIn')
    });
    
    const access_token = signJwt({sub: user.id.toString()}, 'accessTokenPrivateKey', {
        expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`
    });
    const refresh_token = signJwt({sub: user.id.toString()}, 'refreshTokenPrivateKey', {
        expiresIn: `${config.get<number>('refreshTokenExpiresIn')}m`
    })
    return {access_token, refresh_token};
}

