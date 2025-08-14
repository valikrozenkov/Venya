'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton
} from '@mui/material';
import CenterCard from '@/components/CenterCard';
import Link from 'next/link';

// строки для общей таблицы
type Row = { userId: string; name: string; total: number }

// строки расходов из /api/expenses
type ExpenseRow = {
  id: string;
  amount: number;
  description: string | null;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
};

export default function PageStats() {
  const [rows, setRows] = useState<Row[]>([]);
  const [grand, setGrand] = useState(0);

  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);

  // для диалога редактирования
  const [openEdit, setOpenEdit] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({}); // expenseId -> input value

  function loadStats() {
    fetch('/api/stats')
      .then(r => r.json())
      .then((d) => { setRows(d.rows); setGrand(d.grand); })
      .catch(() => { setRows([]); setGrand(0); });
  }

  function loadExpenses() {
    setLoading(true);
    fetch('/api/expenses')
      .then(r => r.json())
      .then((list: ExpenseRow[]) => setExpenses(list))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStats();
    loadExpenses();
  }, []);

  // список расходов выбранного пользователя
  const expensesForUser = useMemo(
    () => expenses.filter(e => e.userId === editUserId),
    [expenses, editUserId]
  );

  function openEditFor(userId: string) {
    setEditUserId(userId);
    // проставим текущие значения в инпуты
    const initial: Record<string, string> = {};
    expenses.filter(e => e.userId === userId).forEach(e => { initial[e.id] = String(e.amount); });
    setEditValues(initial);
    setOpenEdit(true);
  }

  function closeEdit() {
    setOpenEdit(false);
    setEditUserId(null);
    setEditValues({});
  }

  function setAmountInput(expenseId: string, v: string) {
    setEditValues(prev => ({ ...prev, [expenseId]: v }));
  }

  async function saveAmount(expenseId: string) {
    const raw = editValues[expenseId];
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      alert('Введите положительное число');
      return;
    }

    // оптимистичное обновление
    const prev = expenses;
    setExpenses(list => list.map(e => e.id === expenseId ? { ...e, amount: value } : e));

    const res = await fetch(`/api/expenses/${expenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: value }),
    });

    if (!res.ok) {
      // откат если ошибка
      setExpenses(prev);
      alert('Не удалось обновить сумму');
      return;
    }

    // пересчитаем агрегаты
    loadStats();
  }

  return (
    <CenterCard>
      <Stack spacing={2}>
        <Typography variant="h6">Статистика</Typography>

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell align="right">Потрачено</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.userId}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => openEditFor(r.userId)}>Изменить</Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>Итого по всем</strong></TableCell>
                <TableCell align="right"><strong>{grand.toFixed(2)}</strong></TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" gap={1}>
          <Button component={Link} href="/">← Пользователи</Button>
          <Button component={Link} href="/expense">→ Добавить расход</Button>
        </Stack>
      </Stack>

      {/* Диалог редактирования сумм по пользователю */}
      <Dialog open={openEdit} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Изменить суммы</DialogTitle>
        <DialogContent dividers>
          {loading && <Typography>Загрузка…</Typography>}
          {!loading && expensesForUser.length === 0 && (
            <Typography>У пользователя нет расходов</Typography>
          )}

          {!loading && expensesForUser.length > 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell align="right" width={180}>Сумма</TableCell>
                    <TableCell align="center" width={120}>Сохранить</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expensesForUser.map(e => (
                    <TableRow key={e.id}>
                      <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{e.description || '—'}</TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          inputProps={{ step: '0.01', min: '0' }}
                          value={editValues[e.id] ?? ''}
                          onChange={(ev) => setAmountInput(e.id, ev.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button variant="outlined" size="small" onClick={() => saveAmount(e.id)}>
                          Сохранить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </CenterCard>
  );
}
