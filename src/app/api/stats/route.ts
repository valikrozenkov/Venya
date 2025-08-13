import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const perUser = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      expenses: {
        select: { amount: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const rows = perUser.map(u => {
    const total = u.expenses.reduce((s, e) => s + Number(e.amount), 0);
    return { userId: u.id, name: u.name, total };
  });
  const grand = rows.reduce((s, r) => s + r.total, 0);

  return NextResponse.json({ rows, grand });
}
