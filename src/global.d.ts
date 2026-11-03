import { type auth } from "./features/auth/authConfig";

declare module "@solidjs/web" {
	interface RequestEventLocals {
		session: Awaited<ReturnType<typeof auth['api']['getSession']>>;
	}
}