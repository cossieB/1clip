import type { EmailOptions, EmailService } from "./emailService.interface";

export class ConsoleService implements EmailService {
    async sendMail(opts: EmailOptions): Promise<void> {
        console.log(opts.text)
    }
}