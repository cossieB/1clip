import { ConsoleService } from "./ConsoleService"
import { NodemailService } from "./NodeMailerService"

export type EmailOptions = {
    to: string
    subject: string
    text?: string
    html?: string
}

export interface EmailService {
    sendMail(opts: EmailOptions): Promise<void>
}

export const emailService = (function(): EmailService {
    if (process.env.NODE_ENV == 'production')
        return new NodemailService()
    else 
        return new ConsoleService()
})()