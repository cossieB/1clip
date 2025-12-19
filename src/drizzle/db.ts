import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/schema';
import * as auth from './schema/auth';
import {relations} from './relations';

export const db = drizzle(process.env.DATABASE_URL!, {schema: {...schema, ...auth}, relations});
