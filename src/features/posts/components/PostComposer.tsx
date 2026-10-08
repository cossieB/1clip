import { createSignal, Setter } from "solid-js";
import styles from "./PostComposer.module.css";
import { TOKEN_REGEX } from "./PostContent";
import { variables } from "~/utils/variables";

type Props = {
    text: string
    setText: (str: string) => void
}

export function PostComposer(props: Props) {
    let backdropRef!: HTMLDivElement;

    const handleInput = (e: InputEvent & {
        currentTarget: HTMLTextAreaElement;
        target: HTMLTextAreaElement;
    }) => {
        props.setText(e.currentTarget.value);
    };

    const handleScroll = (e: Event & {
        currentTarget: HTMLTextAreaElement;
        target: Element;
    }) => {
        // Sync the scrolling of the backdrop with the textarea
        backdropRef.scrollTop = e.currentTarget.scrollTop;
    };

    const getHighlightedText = () => {
        let content = props.text;
        if (!content) return "";

        // 1. Escape raw HTML tags
        content = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // 2. Wrap links, @mentions, and #hashtags using the scoped CSS class name
        content = content.replace(
            TOKEN_REGEX,
            `<span class="${styles.highlight}">$&</span>`
        );

        // 3. Preserve trailing newline spacing when hitting Enter
        if (content.endsWith("\n")) {
            content += "<br/>";
        }

        return content;
    };

    return (
        <div class={styles.container}>
            <div
                ref={backdropRef}
                class={styles.backdrop}
                innerHTML={getHighlightedText()}
                aria-hidden="true"
            />

            <textarea
                class={styles.textarea}
                value={props.text}
                onInput={handleInput}
                onScroll={handleScroll}
                placeholder="Post content"
                spellcheck={false}
                maxLength={variables.POST_LIMIT}
            />
        </div>
    );
}