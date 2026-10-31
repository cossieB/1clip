export type EmailOptions = {
    to: string
    subject: string
    text?: string
    html?: string,
    id?: string,
    variables?: Record<string, string>
}

export interface EmailService {
    sendMail(opts: EmailOptions): Promise<unknown>
}