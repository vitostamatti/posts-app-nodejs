import Base from './base.entity';
import {Entity,Column,Index, BeforeInsert, OneToMany} from 'typeorm';
import bcrypt from "bcrypt";
import crypto from 'crypto';
import {Post} from './post.entity'

export enum RoleType{
    USER="user",
    ADMIN="admin"
}

@Entity('users')
export class User extends Base {
    @Column()
    name: string;
    
    @Index('email_index')
    @Column({
        unique:true
    })
    email:string;

    @Column()
    password: string

    @Column({
        type:'enum',
        enum:RoleType,
        default:RoleType.USER
    })
    role: RoleType.USER;

    @Column({
        default:false
    })
    verified:boolean;

    @Column({
        type:'text',
        nullable:true
    })
    verificationCode: string | null;

    @OneToMany(()=> Post, (post) => post.user)
    posts: Post[];

    toJSON(){
        return {...this, password:undefined,verified:undefined}
    }

    @BeforeInsert()
    async hashPassword(){
        this.password = await bcrypt.hash(this.password, 12);
    }
    // static is equivalent to a class method in python.
    static async comparePasswords(candidatePassword:string, hashedPassword:string){
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }

    static createVeriificationCode(){
        const verificationCode = crypto.randomBytes(32).toString('hex')

        const hashedVerificationCode = crypto
            .createHash('sha256')
            .update(verificationCode)
            .digest('hex')

        return {verificationCode, hashedVerificationCode};
    }
}