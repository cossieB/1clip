import { useNotificationContext } from "~/hooks/useNotificationContext";
import { For } from "solid-js";
import { NotifMessage } from "~/integrations/notificationService/notificationService.interface";
import { MessageCircleIcon, ThumbsUpIcon, UsersIcon } from "lucide-solid";
import { Dynamic } from "solid-js/web";
import { getRelativeTime } from "~/lib/getRelativeTime";
import styles from "./Notifications.module.css"

export function NotificationsList() {
    const { notifications } = useNotificationContext()
    const not: NotifMessage[] = [{
        date: new Date(),
        message: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
        postId: "2",
        type: "LIKE"
    }, {
        date: new Date(Date.now() - 1000 * 3600),
        message: "Test",
        postId: "2",
        type: "REPLY"
    }, {
        date: new Date(),
        message: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Neque voluptatem dolore iusto cumque accusamus, adipisci, tempora necessitatibus ipsum ratione nostrum laborum cupiditate, sequi nesciunt suscipit! Temporibus doloremque obcaecati quaerat aliquid.",
        postId: "2",
        type: "FOLLOW"
    }]
    return (
        <div class={styles.notifList}>
            <For each={not}>
                {notification => <Notif notification={notification} />}
            </For>
        </div>
    )
}

const icons = {
    LIKE: ThumbsUpIcon,
    REPLY: MessageCircleIcon,
    FOLLOW: UsersIcon
}
function Notif(props: { notification: NotifMessage }) {

    return (
        <div class={styles.notification}>
            <Dynamic component={icons[props.notification.type]} />
            <div>
                {props.notification.message}
            </div>
            <span>
                {getRelativeTime(props.notification.date)}
            </span>
        </div>
    )
}