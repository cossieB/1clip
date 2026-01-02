import { createContext } from "solid-js";
import { SetStoreFunction, Store } from "solid-js/store";

type FormCtx = {
    errors: Store<Record<string, string[]>>
    setErrors: SetStoreFunction<Record<string, string[]>>
}

export const FormContext = createContext<FormCtx>()

