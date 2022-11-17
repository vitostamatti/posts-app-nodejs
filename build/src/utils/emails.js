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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("config"));
const generateSMTPCredentials = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const credentials = yield nodemailer_1.default.createTestAccount();
        console.log(credentials);
    });
};
const pug_1 = __importDefault(require("pug"));
const html_to_text_1 = require("html-to-text");
const smtp = config_1.default.get('smtp');
class Email {
    constructor(user, url) {
        this.user = user;
        this.url = url;
        this.firstName = user.name.split(" ")[0];
        this.to = user.email;
        // this.from = config.get<string>('emailFrom')
        this.from = smtp.user;
    }
    newTransport() {
        return nodemailer_1.default.createTransport(Object.assign(Object.assign({}, smtp), { auth: {
                user: smtp.user,
                pass: smtp.pass
            } }));
    }
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = pug_1.default.renderFile(`${__dirname}/../views/${template}.pug`, {
                firstName: this.firstName,
                subject,
                url: this.url
            });
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                text: (0, html_to_text_1.convert)(html),
                html
            };
            const info = yield this.newTransport().sendMail(mailOptions);
            console.log(nodemailer_1.default.getTestMessageUrl(info));
        });
    }
    sendVerificationCode() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('verificationCode', 'Your account verification code');
        });
    }
    sentPasswordResetToken() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('resetPassword', 'Your password reset token (valid for 10 minutes only)');
        });
    }
    sentTestEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('testEmail', 'Testing Email');
        });
    }
}
exports.default = Email;
