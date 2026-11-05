import z from "zod";

const dobSchema = z.preprocess(
  (value) => value === "" ? null : value,
  z.iso.date().nullish().superRefine((date, ctx) => {
    if (date == null) return;

    const today = new Date();
    const birthDate = new Date(`${date}T00:00:00`);

    if (birthDate > today) {
      ctx.addIssue({
        code: "custom",
        message: "Are you a time traveller?",
      });
      return;
    }

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) age--;

    if (age < 13) {
      ctx.addIssue({
        code: "custom",
        message: "You're a bit too young to be here",
      });
    }
  })
);


export const UpdateUserSchema = z.object({
    displayName: z.string().min(3).max(15).optional(),
    bio: z.string().max(255).optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
    dob: dobSchema.nullish(),
    location: z.string().max(100).nullish(),
    links: z.string().array().transform(arr => arr.slice(0, 5)).optional()
})