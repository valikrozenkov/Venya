import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type Ctx = { params: { id: string } }

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  try {
    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    const body = await req.json()
    const data: { amount?: number; description?: string | null } = {}

    if (body.amount !== undefined) {
      const value = Number(body.amount)
      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
      }
      data.amount = value
    }

    if (body.description !== undefined) {
      const d = body.description?.toString().trim()
      data.description = d || null
    }

    const updated = await prisma.expense.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}
