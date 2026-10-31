import { ConsoleService } from "./ConsoleService"
import { EmailService } from "./emailService.interface"
import { ResendService } from "./ResendService"
import 'server-only'

export const emailService = (function (): EmailService {
    if (process.env.NODE_ENV == 'production')
        return new ResendService()
    else
        return new ConsoleService()
})()