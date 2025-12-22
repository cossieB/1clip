import nodemailer from "nodemailer"
import { EmailOptions, EmailService } from "."

export class NodemailService implements EmailService {
    private transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GOOGLE_APP_PASSWORD
        }
    })
    sendMail = async (opts: EmailOptions ) => {
        this.transporter.sendMail({
            ...opts,
            name: "GG"
        })
    }
}