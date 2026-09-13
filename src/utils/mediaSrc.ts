import { STORAGE_DOMAIN } from "./env";

export const mediaSrc = (src: string) => src.startsWith("blob:") ? src : STORAGE_DOMAIN + src
export const generateUniqueFilename = (filename: string) => crypto.randomUUID() + (filename.match(/\.[^/.]+$/)?.[0] ?? '')
