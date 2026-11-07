import { defineRoutes, int } from "@solidjs/router";
import { PostId } from "./components/PostId";

export const postRoutes = defineRoutes([{
    path: "/posts/:id",
    matchFilters: {
        postId: int
    },
    children: [
        {
            path: "/",
            component: PostId,
        }
    ]
}])