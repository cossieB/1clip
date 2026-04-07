import z from "zod";

export function useLocalStorage<T>(key: string, schema: z.ZodType<T>) {
    function setItem(value: T) {
        localStorage.setItem(key, JSON.stringify(value))
    }
    function getItem() {
        const val = localStorage.getItem(key)
        if (!val) return null
        const validated = schema.safeParse(JSON.parse(val))
        if (!validated.success) {
            console.log(validated.error)
            localStorage.removeItem(key)
            return null
        }
        return validated.data
    }

    return {getItem, setItem}
}