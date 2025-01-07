import { hashPassword } from '@/lib/db';

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const password = searchParams.get('password');
  const hashed = await hashPassword(password);
  return Response.json({ hashed });
}
