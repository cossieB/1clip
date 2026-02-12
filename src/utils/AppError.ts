import { setResponseStatus } from "@tanstack/solid-start/server";
import { HttpStatusCode } from "./statusCodes";

export class AppError extends Error {
    constructor(
        public readonly message: string, 
        public readonly status: HttpStatusCode) {
        super(message);
        setResponseStatus(status)
    }
}