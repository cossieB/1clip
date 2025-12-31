import { SQL } from "drizzle-orm"

export type Filters = {
    filters: SQL[]
    limit?: number,
    offset?: number
}