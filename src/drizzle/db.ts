import { drizzle } from 'drizzle-orm/node-postgres';
import {relations} from './relations';
import env from 'virtual:solid-env/server';
import "server-only"

export const db = drizzle(env.DATABASE_URL, {relations});