import { defineRoutes, int } from "@solidjs/router";
import { PostId } from "./components/PostId";
import { CreatePostPage } from "./components/CreatePostPage";

export const postRoutes = defineRoutes([
    {
        path: "/posts/:postId",
        matchFilters: {
            postId: int
        },
        component: PostId,
    },{
        path: "/posts/create",
        component: CreatePostPage
    }
])