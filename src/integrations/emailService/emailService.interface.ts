export type EmailOptions = {
    to: string
    subject: string
    text?: string
    html?: string
}

export interface EmailService {
    sendMail(opts: EmailOptions): Promise<unknown>
}