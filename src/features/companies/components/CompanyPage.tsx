import { AwaitedReturn } from "~/lib/utilityTypes";
import { getCompanyFn } from "../companiesApi";
import styles from "./CompanyPage.module.css"
import { mediaSrc } from "~/utils/mediaSrc";
import { LazyRender } from "~/components/LazyRender";
import { GamesList } from "~/features/games/components/GamesList";

export function CompanyPage(props: {company: NonNullable<AwaitedReturn<typeof getCompanyFn>>}) {
    return (
        <div class={styles.container}>
            <div class={styles.logoContainer}>
            <img src={mediaSrc(props.company.logo)} alt="" />
            </div>
            <h1> {props.company.name} </h1>
            <div class={["card", styles.overview]}  >
                <label >Overview</label>
                <div innerHTML={props.company.summary} />
            </div>
            <LazyRender>
                <h2>Games Developed</h2>
                <GamesList filters={{developerId: props.company.companyId}} />
            </LazyRender>      
            &nbsp;  
            <LazyRender>
                <h2>Games Published</h2>
                <GamesList filters={{publisherId: props.company.companyId}} />
            </LazyRender>        
        </div>
    )
}