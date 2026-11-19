
import * as api from "../companiesApi"
import { useUpload } from "~/hooks/useUpload";
import { countryList } from "~/utils/countryList";
import { ContentEditable } from "~/components/Forms/ContentEditable";
import { getLogoSignedUrls } from "~/integrations/storageService/serverFn";
import { createSignal, createStore, useContext } from "solid-js";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { TextField } from "~/components/Forms/Textfield";
import { ImageUpload } from "~/components/Forms/ImageUpload";
import { FormSelect } from "~/components/Forms/FormSelect";
import { AwaitedReturn } from "~/lib/utilityTypes";
import { useToastError } from "~/hooks/useToastError";
import styles from "./CompanyForm.module.css"

type Company = Awaited<ReturnType<typeof api.getCompanyFn>>

export function CompanyForm(props: { company?: Company}) {
    const abortController = new AbortController
    const { addToast } = useContext(ToastContext)
    const toastError = useToastError()
    const [company, setCompany] = createStore(() => ({
        companyId: props.company?.companyId,
        name: props.company?.name ?? "",
        country: props.company?.country ,
        headquarters: props.company?.headquarters,
        logo: props.company?.logo ?? "",
        summary: props.company?.summary ?? ""
    }))
    const { isUploading, setFiles, convertAndUpload } = useUpload(abortController)
    const [submitting, setSubmitting] = createSignal(false)

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const files: AwaitedReturn<typeof convertAndUpload> = await convertAndUpload(getLogoSignedUrls)
            const f = files.at(0)
            if (f) setCompany(s => { s.logo = f.key })

            if (company.companyId) {                
                const edited = await api.editCompanyFn({ ...company, companyId: company.companyId });
                setCompany(() => edited)
                addToast({ text: "Successfully edited developer, " + company.companyId, type: "info" }) 
                setCompany(() => edited)               
            }
            else {                
                await api.createCompanyFn(company)
            }
        }
        catch (error) {
            toastError(error)
        }
        finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <form
                class={["form card", styles.form]}
                onSubmit={handleSubmit}
            >
                <TextField
                    label="Name"
                    onChange={e => setCompany(s => { s.name = e.currentTarget.value })}
                    autocomplete="off"
                    value={company.name}
                />
                <ImageUpload
                    setFile={(file, objectUrl) => {
                        setFiles(s => [{ file, field: "logo" }])
                        setCompany(s => { s.logo = objectUrl })
                    }}
                    image={company.logo}
                />
                <FormSelect
                    label="Country"
                    list={countryList}
                    selected={company.country ?? null}
                    setSelected={country => setCompany(s => { s.country = country })}
                />
                <TextField
                    label="Headquarters"
                    onChange={e => setCompany(s => { s.headquarters = e.currentTarget.value })}
                    value={company.headquarters ?? ""}
                />

                <ContentEditable
                    html={company.summary}
                    setter={summary => setCompany(s => { s.summary = summary })}
                    label="Summary"
                />
                <button
                    type="submit"
                    disabled={
                        !company.name ||
                        !company.country ||
                        !company.headquarters ||
                        !company.logo ||
                        !company.summary ||
                        isUploading() ||
                        submitting()
                    }
                >
                    Submit
                </button>
            </form>
        </div>
    )
}

