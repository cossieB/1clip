import { createContext, type JSXElement } from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

type FormCtx = {
    errors: Store<Record<string, string[]>>
    setErrors: SetStoreFunction<Record<string, string[]>>
}

export const FormContext = createContext<FormCtx>()

export function FormProvider(props: {children: JSXElement}) {
    const [errors, setErrors] = createStore<Record<string, string[]>>({})
    return (
        <FormContext.Provider value={{errors, setErrors}}>
            {props.children}
        </FormContext.Provider>
    )
}