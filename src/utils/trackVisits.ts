import { createServerFn, createServerOnlyFn } from "@tanstack/solid-start"
import { redis } from "./redis.server"
import { getRequest } from "@tanstack/solid-start/server"

const TTL_SECONDS = 60 * 60 * 24 * 90
const COOLDOWN_SECONDS = 60 * 30

export const trackVisit = createServerFn().handler(async () => {
    const request = getRequest()
    const h = request.headers
    const ip = h.get('cf-connecting-ip') ?? 'unknown'
    const country = h.get('cf-ipcountry') ?? 'XX'
    const city = h.get('cf-ipcity') ?? 'unknown'
    const continent = h.get('cf-ipcontinent') ?? 'unknown'
    const path = new URL(request.url).pathname

    if (path.startsWith('/_') || path.match(/\.(js|css|png|jpg|svg|ico|woff2?)$/)) return 

    const date = new Date().toISOString().slice(0, 10)

    const cooldownKey = `stats:cooldown:${ip}:${path}`
    const isNew = await redis.set(cooldownKey, '1', {NX: true, EX: COOLDOWN_SECONDS})

    if (!isNew) return

    const multi = redis.multi()
    multi.incr(`stats:pageviews:${date}`)
    multi.pfAdd(`stats:visitors:${date}`, ip)
    multi.hIncrBy(`stats:country:${date}`, country, 1)
    multi.hIncrBy(`stats:city:${date}`, city, 1)
    multi.hIncrBy(`stats:continent:${date}`, continent, 1)
    multi.hIncrBy(`stats:path:${date}`, path, 1)
    multi.expire(`stats:pageviews:${date}`, TTL_SECONDS)
    multi.expire(`stats:visitors:${date}`, TTL_SECONDS)
    multi.expire(`stats:country:${date}`, TTL_SECONDS)
    multi.expire(`stats:city:${date}`, TTL_SECONDS)
    multi.expire(`stats:continent:${date}`, TTL_SECONDS)
    multi.expire(`stats:path:${date}`, TTL_SECONDS)

    void multi.exec()
})