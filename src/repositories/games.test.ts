import { expect, test } from 'vitest'

test("init", () => {
    expect(process.env.DATABASE_URL).toBeDefined()
})