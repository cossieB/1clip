import { useContext } from "solid-js";
import { FormContext } from "~/Forms/FormContext";

export function useFormContext() {
    const ctx = useContext(FormContext)
    if (!ctx) throw new Error("Form, FormInput have to be descendends of FormProvider")
    return ctx
}