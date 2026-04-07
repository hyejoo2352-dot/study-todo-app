// GET  /api/tasks — DB에서 태스크 전체를 조회해서 반환합니다.
// POST /api/tasks — 새 태스크를 DB에 저장합니다.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "asc" },
  });
  return Response.json(tasks);
}

export async function POST(req: NextRequest) {
  const { title, section, emoji } = await req.json();

  if (!title || !section || !emoji) {
    return Response.json(
      { error: "title, section, emoji는 필수입니다." },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: { title, section, emoji },
  });
  return Response.json(task, { status: 201 });
}
