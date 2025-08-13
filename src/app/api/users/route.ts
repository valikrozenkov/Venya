import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const { name, phone, email } = await req.json();
    if (!name?.trim() || !phone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'name, phone, email are required' }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: { name: name.trim(), phone: phone.trim(), email: email.trim() },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
