import { ParentProps } from "solid-js";
import { NavTabs } from "~/NavTabs/NavTabs";
import { paths } from "~/router";

export function SettingsLayout(props: ParentProps) {
    return (
        <>        
            <NavTabs
                tabs={[{
                    href: paths.settings.profile(),
                    label: "Profile"
                }, {
                    href: paths.settings.security(),
                    label: "Security"
                }]}
            />
            {props.children}
        </>
    )
}