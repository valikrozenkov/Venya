import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

type Ctx = { params: { id: string } }

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return NextResponse.json(
        { error: 'Нельзя удалить пользователя: у него есть расходы. Сначала удалите их.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
