import env from "virtual:solid-env/client"

export const mediaSrc = (src: string) => src.startsWith("blob:") ? src : `${env.VITE_STORAGE_DOMAIN}/${src}`
export const generateUniqueFilename = (filename: string) => crypto.randomUUID() + (filename.match(/\.[^/.]+$/)?.[0] ?? '')
