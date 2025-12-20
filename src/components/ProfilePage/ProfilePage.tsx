import styles from "./ProfilePage.module.css"

type Props = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    username?: string | null | undefined;
    displayUsername?: string | null | undefined;
}

function ProfilePage(props: Props) {
    return (
        <div class={styles.container}>
            <div class={styles.banner}>
                <div></div>
            </div>
        </div>
    )
}
