export function getRank(xp: number) {
    if (xp < 100 ) return "bronze"
    if (xp < 200) return "silver"
    if (xp < 500) return "gold"
    if (xp < 1000) return "platinum"
    if (xp < 2000) return "diamond"
    else return "master"
}