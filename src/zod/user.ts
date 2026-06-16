import z from "zod";

export const UpdateUserSchema = z.object({
    displayName: z.string().min(3).max(15).optional(),
    bio: z.string().max(255).optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
    dob: z.iso.date().nullish(),
    location: z.string().max(100).nullish(),
    links: z.string().array().transform(arr => arr.slice(0, 5)).optional()
})
    .superRefine((data, ctx) => {
        if (Object.keys(data).length == 0)
            ctx.addIssue({
                code: "custom",
                message: "Nothing to update",                
            })
    })