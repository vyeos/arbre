import { App } from "@/app/api/elysia/[...all]/route";
import { edenTreaty } from "@elysiajs/eden";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const api = edenTreaty<App>(`${baseUrl}/api/elysia`);
