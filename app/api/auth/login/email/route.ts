import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  return auth.handler(request);
}
