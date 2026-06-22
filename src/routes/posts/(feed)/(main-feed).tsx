import { MySiteTitle } from "~/components/MySiteTitle";
import { PostList } from "~/features/posts/components/PostList";

export default function MainFeed() {

    return (
        <>
            <MySiteTitle>Home</MySiteTitle>
            <PostList />
        </>
    )
}