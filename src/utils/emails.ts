import nodemailer from 'nodemailer';
import config from 'config';
import { User } from '../entities/user.entity';
const generateSMTPCredentials = async function () {
  const credentials = await nodemailer.createTestAccount();
  console.log(credentials);
}
import pug from 'pug';
import customEnvironmentVariables from '../../config/custom-environment-variables';

import {convert} from 'html-to-text'

const smtp = config.get<{
    host:string;
    port:number;
    user:string;
    pass:string;
}>('smtp')

export default class Email{
    firstName: string;
    to: string;
    from: string;

    constructor(public user: User, public url: string){
        this.firstName = user.name.split(" ")[0]
        this.to = user.email
        // this.from = config.get<string>('emailFrom')
        this.from = smtp.user
    }

    private newTransport(){
        return nodemailer.createTransport({
            ...smtp,
            auth:{
                user:smtp.user,
                pass:smtp.pass
            }
        });
    }

    private async send(template: string, subject:string){
        const html = pug.renderFile(
            `${__dirname}/../views/${template}.pug`,{
                firstName: this.firstName,
                subject,
                url: this.url
            }
        )
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: convert(html),
            html
        }

        const info = await this.newTransport().sendMail(
            mailOptions
        );

        console.log(nodemailer.getTestMessageUrl(info))
    }

    async sendVerificationCode(){
        await this.send(
            'verificationCode', 'Your account verification code'
        )
    }

    async sentPasswordResetToken(){
        await this.send(
            'resetPassword',
            'Your password reset token (valid for 10 minutes only)'
        )
    }
    async sentTestEmail(){
        await this.send(
            'testEmail',
            'Testing Email'
        )
    }

}