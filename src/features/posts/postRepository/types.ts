import type { Media } from "~/drizzle/models";

export type PostInsert = {
    title: string;
    userId: string;
    gameId?: number;
    media: {
        key: string;
        contentType: string;
        metadata?: Record<string, string>;
    }[];
    text: string;
    tags: string[];
    pending: boolean;
};
