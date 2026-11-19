import * as companiesRepository from "./companiesRepository"
import z from "zod";
import { LimitOffsetSchema } from "~/utils/zod";
import { CompanyCreateSchema, CompanyEditSchema } from "./utils/zod";
import { orphanedFileService } from "~/services/orphanedFileService";
import { storageService } from "~/integrations/storageService/index.server";
import { db } from "~/drizzle/db";
import { GET } from "@solidjs/web/server-functions";
import { zodSafeParse } from "~/utils/zodSafeParse";
import { redirect, respond } from "@solidjs/web";
import { ensureAdmin } from "../auth/utils/ensureAuth";
import { paths } from "~/router";

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
    const company = await companiesRepository.findById(data)
    return respond(company ?? null, {
        headers: {
            "Cache-Control": company ? "public, max-age=604800, stale-while-revalidate=86400" : "public, max-age=300",
            ...(company && {
                "Last-Modified": (company.dateModified ?? company.dateAdded).toUTCString()
            })
        }
    });

})

export async function createCompanyFn(input: z.input<typeof CompanyCreateSchema>) {
    'use server'
    const data = zodSafeParse(CompanyCreateSchema, input)
    await ensureAdmin()
    const company = await companiesRepository.createDeveloper(data)
    orphanedFileService.removePendingUpload(data.logo);
    return redirect(paths.admin.companies(company.companyId)())
}

export async function editCompanyFn(input: z.input<typeof CompanyEditSchema>) {
    'use server'
    const data = zodSafeParse(CompanyEditSchema, input)
    await ensureAdmin();
    const { companyId, ...rest } = data;
    const [old] = await companiesRepository.editDeveloper(companyId, rest);

    if (data.logo) {
        orphanedFileService.removePendingUpload(data.logo);
        (data.logo != old.oldLogo) && storageService.moveToDeletedBucket(old.oldLogo)
    }
    return old
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

export const getCompaniesAdminFn = GET(async (args: z.input<typeof LimitOffsetSchema>) => {
    'use server'
    const companies = await getCompaniesFn(args)
    return respond(companies, {
        headers: {
            "Cache-Control": "no-store"
        }
    })
})
