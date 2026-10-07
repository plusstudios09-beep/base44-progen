import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { hashPassword, verifyPassword } from '../../shared/hash.ts';

const PERMS: Record<string, string | null> = {
  me: null, logout: null,
  changePassword: "manage_settings", changeUsername: "manage_settings",
  createClient: "manage_clients", updateClient: "manage_clients",
  deleteClient: "manage_clients", duplicateClient: "manage_clients",
  setClientStatus: "manage_clients",
  createStaff: "manage_staff", updateStaff: "manage_staff",
  deleteStaff: "manage_staff", listStaff: "manage_staff",
  createTemplate: "manage_clients", updateTemplate: "manage_clients", deleteTemplate: "manage_clients"
};

const RESERVED_SLUGS = ["login", "admin", "settings", "stats", "api", "c", "card"];

async function uniqueSlug(C: any, slug: string, ignoreId?: string) {
  if (!slug) return { error: "الرابط مطلوب" };
  if (RESERVED_SLUGS.includes(slug)) return { error: "هذا الرابط محجوز" };
  const dup = await C.filter({ slug }, { limit: 10 });
  const items = dup.items || [];
  if (items.some((s: any) => s.id !== ignoreId)) return { error: "الرابط مستخدم لعميل آخر" };
  return null;
}

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const token = body?.token;
    const op = body?.op;
    const data = body?.data || {};
    const base44 = createClientFromRequest(req);

    if (!token || !op) return Response.json({ error: "طلب غير صالح" }, { status: 400 });
    const res = await base44.asServiceRole.entities.Staff.filter({ session_token: token }, { limit: 10 });
    const staff = (res.items || [])[0];
    if (!staff) return Response.json({ error: "انتهت الجلسة، سجّل الدخول مجدداً" }, { status: 401 });

    const isOwner = staff.role === "owner";
    const perms = staff.permissions || {};
    const required = PERMS[op];
    if (required === undefined) return Response.json({ error: "عملية غير معروفة" }, { status: 400 });
    if (!isOwner && required && !perms[required]) {
      return Response.json({ error: "لا تملك صلاحية لهذا الإجراء" }, { status: 403 });
    }

    const S = base44.asServiceRole.entities.Staff;
    const C = base44.asServiceRole.entities.Client;
    const T = base44.asServiceRole.entities.Template;

    switch (op) {
      case "me":
        return Response.json({ user: { id: staff.id, username: staff.username, role: staff.role, full_name: staff.full_name, permissions: perms } });

      case "logout":
        await S.update(staff.id, { session_token: null });
        return Response.json({ ok: true });

      case "changePassword": {
        if (!verifyPassword(data.currentPassword, staff.password_hash))
          return Response.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
        if ((data.newPassword || "").length < 4)
          return Response.json({ error: "كلمة المرور الجديدة قصيرة جداً" }, { status: 400 });
        await S.update(staff.id, { password_hash: hashPassword(data.newPassword) });
        return Response.json({ ok: true });
      }

      case "changeUsername": {
        if (!verifyPassword(data.currentPassword, staff.password_hash))
          return Response.json({ error: "كلمة المرور غير صحيحة" }, { status: 400 });
        const newUsername = (data.newUsername || "").trim();
        if (!newUsername) return Response.json({ error: "اسم المستخدم مطلوب" }, { status: 400 });
        const dup = await S.filter({ username: newUsername }, { limit: 10 });
        if ((dup.items || []).some((s: any) => s.id !== staff.id))
          return Response.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
        await S.update(staff.id, { username: newUsername });
        return Response.json({ ok: true, username: newUsername });
      }

      case "listStaff": {
        const all = await S.filter({}, { limit: 100 });
        return Response.json({ staff: (all.items || []).map((s: any) => ({
          id: s.id, username: s.username, role: s.role, full_name: s.full_name, permissions: s.permissions || {}
        })) });
      }

      case "createStaff": {
        const username = (data.username || "").trim();
        if (!username || !data.password) return Response.json({ error: "بيانات غير مكتملة" }, { status: 400 });
        const dup = await S.filter({ username }, { limit: 10 });
        if ((dup.items || []).length) return Response.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
        const created = await S.create({
          username,
          password_hash: hashPassword(data.password),
          role: data.role || "staff",
          full_name: data.full_name || "",
          permissions: data.permissions || {}
        });
        return Response.json({ ok: true, id: created.id });
      }

      case "updateStaff": {
        const upd: any = {};
        if (data.username) {
          const u = data.username.trim();
          const dup = await S.filter({ username: u }, { limit: 10 });
          if ((dup.items || []).some((s: any) => s.id !== data.id))
            return Response.json({ error: "اسم المستخدم مستخدم" }, { status: 400 });
          upd.username = u;
        }
        if (data.password) upd.password_hash = hashPassword(data.password);
        if (data.role) upd.role = data.role;
        if (data.full_name !== undefined) upd.full_name = data.full_name;
        if (data.permissions) upd.permissions = data.permissions;
        await S.update(data.id, upd);
        return Response.json({ ok: true });
      }

      case "deleteStaff": {
        if (data.id === staff.id) return Response.json({ error: "لا يمكن حذف حسابك الحالي" }, { status: 400 });
        const target = await S.get(data.id);
        if (target.role === "owner") return Response.json({ error: "لا يمكن حذف حساب المالك" }, { status: 400 });
        await S.delete(data.id);
        return Response.json({ ok: true });
      }

      case "createClient": {
        const slugErr = await uniqueSlug(C, (data.slug || "").trim().toLowerCase());
        if (slugErr) return Response.json({ error: slugErr.error }, { status: 400 });
        const created = await C.create(data);
        return Response.json({ ok: true, id: created.id, slug: created.slug });
      }

      case "updateClient": {
        const { id, ...patch } = data;
        if (patch.slug) {
          patch.slug = patch.slug.trim().toLowerCase();
          const slugErr = await uniqueSlug(C, patch.slug, id);
          if (slugErr) return Response.json({ error: slugErr.error }, { status: 400 });
        }
        await C.update(id, patch);
        return Response.json({ ok: true });
      }

      case "deleteClient": {
        await C.delete(data.id);
        return Response.json({ ok: true });
      }

      case "duplicateClient": {
        const orig: any = await C.get(data.id);
        const copy: any = { ...orig };
        delete copy.id; delete copy.created_date; delete copy.updated_date; delete copy.created_by_id;
        copy.name = (orig.name || "") + " (نسخة)";
        let baseSlug = (orig.slug || "card") + "-copy";
        let candidate = baseSlug;
        let i = 1;
        while ((await uniqueSlug(C, candidate)).error) { candidate = `${baseSlug}-${i++}`; }
        copy.slug = candidate;
        copy.status = "active";
        const created = await C.create(copy);
        return Response.json({ ok: true, id: created.id, slug: created.slug });
      }

      case "setClientStatus": {
        await C.update(data.id, { status: data.status });
        return Response.json({ ok: true });
      }

      case "createTemplate": {
        const name = (data.name || "").trim();
        if (!name) return Response.json({ error: "اسم القالب مطلوب" }, { status: 400 });
        const created = await T.create({ name, layout: data.layout || {}, buttons: data.buttons || [] });
        return Response.json({ ok: true, id: created.id });
      }

      case "updateTemplate": {
        const { id, ...patch } = data;
        if (!id) return Response.json({ error: "معرّف القالب مطلوب" }, { status: 400 });
        await T.update(id, patch);
        return Response.json({ ok: true });
      }

      case "deleteTemplate": {
        await T.delete(data.id);
        return Response.json({ ok: true });
      }

      default:
        return Response.json({ error: "عملية غير معروفة" }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}