import { toSolidStartHandler } from "better-auth/solid-start";
import { auth } from "~/features/auth/server";

export const { GET, POST } = toSolidStartHandler(auth);
