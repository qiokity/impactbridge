import "server-only";
import { db } from "@/lib/db";

export async function writeAudit(input: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: object;
  after?: object;
}) {
  await db().auditLog.create({ data: input });
}
