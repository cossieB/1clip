import { createClientOnlyFn } from "@tanstack/solid-start";

interface ConvertOptions {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
}


export const convertToWebP = createClientOnlyFn(function (
    file: File,
    quality: number = 0.9,
    maxWidth?: number,
    maxHeight?: number
): Promise<File> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            return reject(new Error('File must be an image.'));
        }

        const img: HTMLImageElement = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (maxWidth && width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            if (maxHeight && height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }

            const canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

            if (!ctx) {
                URL.revokeObjectURL(img.src);
                return reject(new Error('Failed to get canvas 2d context.'));
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob: Blob | null) => {
                if (!blob) {
                    URL.revokeObjectURL(img.src);
                    return reject(new Error('Canvas compilation failed.'));
                }

                const newFileName: string = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const webpFile: File = new File([blob], newFileName, { type: 'image/webp' });

                URL.revokeObjectURL(img.src);
                resolve(webpFile);
            }, 'image/webp', quality);
        };

        img.onerror = (err: Event | string) => {
            URL.revokeObjectURL(img.src);
            reject(err);
        };
    });
})