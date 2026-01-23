import { setResponseStatus } from "@tanstack/solid-start/server";
import { HttpStatusCode } from "./statusCodes";

export class AppError extends Error {
    constructor(message: string, status: HttpStatusCode) {
        super(message);
        setResponseStatus(status)
    }
}