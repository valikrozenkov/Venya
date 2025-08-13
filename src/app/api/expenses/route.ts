import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, amount, description } = await req.json();
    const value = Number(amount);
    if (!userId || !Number.isFinite(value) || value <= 0) {
      return NextResponse.json({ error: 'userId and positive amount are required' }, { status: 400 });
    }
    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: value,
        description: description?.toString().trim() || null,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
