import { CreateEmailOptions, Resend } from 'resend';
import type { EmailOptions, EmailService } from "./emailService.interface"
import env from 'virtual:solid-env/server';

export class ResendService implements EmailService {
    private resend = new Resend(env.RESEND_KEY)
    sendMail = async (opts: EmailOptions & {id: string, variables: Record<string, string>} ) => {
        
        return this.resend.emails.send({
            to: opts.to,
            template: {
                id: opts.id,
                variables: opts.variables
            }
        })
    }
}