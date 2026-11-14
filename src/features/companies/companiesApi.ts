import * as companiesRepository from "./companiesRepository"
import { LimitOffsetSchema } from "~/utils/zod";
import { CompanyCreateSchema, CompanyEditSchema } from "./utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { storageService } from "~/integrations/storageService/index.server";
import z from "zod";
import { db } from "~/drizzle/db";
import { GET } from "@solidjs/web/server-functions";
import { zodSafeParse } from "~/utils/zodSafeParse";
import { respond } from "@solidjs/web";
import { ensureAdmin } from "../auth/utils/ensureAuth";

export const getCompaniesFn = GET(async (args: z.input<typeof LimitOffsetSchema>) => {
    'use server'
    const data = zodSafeParse(LimitOffsetSchema, args)
    const companies = await companiesRepository.findAll(data);
    return respond(companies, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }        
    })
})

export const getCompanyFn = GET(async (id: number) => {
    'use server'
    const data = zodSafeParse(z.int(), id)
    const dev = await companiesRepository.findById(data)
    return respond(dev ?? null, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }        
    })
})

export async function createCompanyFn(input: z.input<typeof CompanyCreateSchema>) {
    'use server'
    const data = zodSafeParse(CompanyCreateSchema, input)
    await ensureAdmin()
    const d = await companiesRepository.createDeveloper(data)
    orphanedFileService.removePendingUpload(data.logo)
    return d;
}

export async function editCompanyFn(input: z.input<typeof CompanyEditSchema>) {
    'use server'
    const data = zodSafeParse(CompanyEditSchema, input)
    await ensureAdmin()
    const { developerId, ...rest } = data;
    const [old] = await companiesRepository.editDeveloper(developerId, rest);      
    if (data.logo) {
        orphanedFileService.removePendingUpload(data.logo);
        (data.logo != old.oldLogo) && storageService.moveToDeletedBucket(old.oldLogo)
    }
}

export const searchCompaniesFn = GET(async (name: string) => {
    'use server'
    const data = zodSafeParse(z.string().nonempty(), name)
    const companies = await db.query.companies.findMany({
        columns: {
            name: true,
            companyId: true
        },
        where: {
            name: {
                ilike: `%${data}%`
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    return respond(companies, {
        headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400"
        }        
    })
})
