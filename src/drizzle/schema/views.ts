import { getColumns } from "drizzle-orm"
import { pgView } from "drizzle-orm/pg-core"
import { games, developers, publishers, platforms, actors } from "./schema"

export const gamesView = pgView("games_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(games)
    return qb.select({...rest}).from(games)
})

export const developersView = pgView("developers_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(developers)
    return qb.select({...rest}).from(developers)
})


export const publishersView = pgView("publishers_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(publishers)
    return qb.select({...rest}).from(publishers)
})

export const platformsView = pgView("platforms_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(platforms)
    return qb.select({...rest}).from(platforms)
})

export const actorsView = pgView("actors_view").as(qb => {
    const { dateAdded, dateModified, ...rest } = getColumns(actors)
    return qb.select({...rest}).from(actors)
})
