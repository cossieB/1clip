import { defineRoutes, int } from "@solidjs/router";
import { PostId } from "./components/PostId";

export const postRoutes = defineRoutes([{
    path: "/posts/:postId",
    matchFilters: {
        postId: int
    },
    component: PostId,
    
}])