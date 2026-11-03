import { toSolidStartHandler } from "better-auth/solid-start";
import { auth } from "~/features/auth/authConfig";

export const { GET, POST } = toSolidStartHandler(auth);
