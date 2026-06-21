import { Title } from "@solidjs/meta";
import { PostList } from "~/features/posts/components/PostList";

export default function MainFeed() {

    return (
        <>
            <Title>Home</Title>
            <PostList />
        </>
    )
}