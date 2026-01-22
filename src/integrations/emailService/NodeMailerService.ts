import nodemailer from "nodemailer"
import type { EmailOptions, EmailService } from "./emailService.interface"

export class NodemailService implements EmailService {
    private transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GOOGLE_APP_PASSWORD
        }
    })
    sendMail = async (opts: EmailOptions ) => {
        return this.transporter.sendMail({
            ...opts,
            name: "1Clip"
        })
    }
}