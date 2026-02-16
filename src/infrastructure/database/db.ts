import { D1Database } from '@cloudflare/workers-types';

export interface IDatabase {
    d1: D1Database;
}
