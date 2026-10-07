import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { verifyPassword } from '../../shared/hash.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const username = (body?.username || "").trim();
    const password = body?.password || "";
    if (!username || !password) {
      return Response.json({ error: "بيانات الدخول غير مكتملة" }, { status: 400 });
    }
    const base44 = createClientFromRequest(req);
    const res = await base44.asServiceRole.entities.Staff.filter({ username }, { limit: 10 });
    const staff = (res.items || [])[0];
    if (!staff || !verifyPassword(password, staff.password_hash)) {
      return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }
    const token = crypto.randomUUID();
    await base44.asServiceRole.entities.Staff.update(staff.id, { session_token: token });
    return Response.json({
      token,
      user: {
        id: staff.id,
        username: staff.username,
        role: staff.role,
        full_name: staff.full_name,
        permissions: staff.permissions || {}
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}