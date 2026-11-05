import z from "zod";

export const NotificationsSchema = z.object({
    message: z.string(),
    type: z.enum(["LIKE", "REPLY", "FOLLOW"]),
    link: z.string(),
})

export type UserNotification = z.infer<typeof NotificationsSchema>