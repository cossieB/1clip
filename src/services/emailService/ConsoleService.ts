import { EmailOptions, EmailService } from ".";

export class ConsoleService implements EmailService {
    async sendMail(opts: EmailOptions): Promise<void> {
        console.log(opts.text)
    }
}