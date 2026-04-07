// 이 파일은 PrismaClient 싱글턴을 만드는 파일입니다.
// 싱글턴이란? 앱 전체에서 DB 연결을 딱 하나만 유지하는 패턴입니다.
// Next.js 개발 모드에서는 파일을 수정할 때마다 서버가 재시작되는데,
// 그때마다 새 DB 연결이 생기는 것을 막기 위해 globalThis에 저장해둡니다.

import { PrismaClient } from "../app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
