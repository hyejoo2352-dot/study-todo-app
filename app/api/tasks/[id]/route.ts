// PATCH  /api/tasks/[id] — 태스크 내용을 수정합니다 (제목, 섹션, done, startedAt 등).
// DELETE /api/tasks/[id] — 태스크를 DB에서 삭제합니다.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await ctx.params;
  const body = await req.json();

  const task = await prisma.task.update({
    where: { id: Number(id) },
    data: body,
  });
  return Response.json(task);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await ctx.params;

  await prisma.task.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}
