import { setResponseStatus } from "@tanstack/solid-start/server";

export class AppError extends Error {
    constructor(message: string, status: number) {
        super(message);
        setResponseStatus(status)
    }
}