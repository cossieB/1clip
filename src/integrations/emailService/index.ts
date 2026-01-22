import { ConsoleService } from "./ConsoleService"
import { EmailService } from "./emailService.interface"
import { NodemailService } from "./NodeMailerService"

export const emailService = (function(): EmailService {
    if (process.env.NODE_ENV == 'production')
        return new NodemailService()
    else 
        return new ConsoleService()
})()