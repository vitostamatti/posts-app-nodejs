import Base from './base.entity';
import {Entity,Column, ManyToOne, JoinColumn} from 'typeorm';
import { User } from './user.entity';

@Entity('posts')
export class Post extends Base {

    @Column({
        unique:true
    })
    title: string;

    @Column()
    content:string;

    @ManyToOne(() => User, (user)=> user.posts)
    @JoinColumn()
    user: User;

}
