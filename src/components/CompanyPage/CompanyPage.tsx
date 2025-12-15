import styles from "./CompanyPage.module.css"

type Props = {
    id: number,
    name: string,
    logo: string | null,
    summary: string
}

export function CompanyPage(props: Props) {
    return (
        <div>
            <div class={styles.header} >
                <img src={props.logo ?? ""} alt="" />
            </div>
            <div class={`${styles.main} paras`} innerHTML={props.summary} />
        </div>
    )
}