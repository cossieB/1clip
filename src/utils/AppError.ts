import { setResponseStatus } from "@solidjs/start/http";
import { HttpStatusCode } from "./statusCodes";

export class AppError extends Error {
    constructor(
        public readonly message: string, 
        public readonly status: HttpStatusCode) {
        super(message);
        setResponseStatus(status);
        this.name = "AppError";
    }
}