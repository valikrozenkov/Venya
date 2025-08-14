'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import CenterCard from '@/components/CenterCard';
import Link from 'next/link';

type User = { id: string; name: string; email: string };
type ExpenseRow = {
  id: string;
  amount: number;
  description: string | null;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
};

export default function PageExpense() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const loadExpenses = useCallback(() => {
    setLoading(true);
    fetch('/api/expenses')
      .then(r => r.json())
      .then((rows: ExpenseRow[]) => setExpenses(rows))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
    loadExpenses();
  }, [loadUsers, loadExpenses]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!userId || !Number.isFinite(value) || value <= 0) return;

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount: value, description: description.trim() }),
    });

    if (!res.ok) return;

    setUserId(''); setAmount(''); setDescription('');
    loadExpenses(); // обновим список расходов
  }

  async function onDelete(id: string) {
    // оптимистичное обновление
    const prev = expenses;
    setExpenses((rows) => rows.filter(r => r.id !== id));
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      // откатываем если не получилось
      setExpenses(prev);
      alert('Не удалось удалить расход');
    }
  }

  return (
    <CenterCard>
      <Stack component="form" onSubmit={onSubmit} spacing={2}>
        <Typography variant="h6">Добавить расход</Typography>

        <TextField
          select label="Пользователь" value={userId} onChange={(e) => setUserId(e.target.value)} required
        >
          {users.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.name} — {u.email}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="number" inputProps={{ step: '0.01', min: '0' }}
          label="Сумма" value={amount} onChange={(e) => setAmount(e.target.value)} required
        />

        <TextField label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />

        <Box display="flex" gap={1}>
          <Button type="submit" variant="contained">Сохранить</Button>
          <Button component={Link} href="/" variant="outlined">← Назад</Button>
          <Button component={Link} href="/stats" variant="text">Статистика</Button>
        </Box>
      </Stack>

      {/* список существующих расходов */}
      <Stack mt={4} spacing={1}>
        <Typography variant="h6">Последние расходы</Typography>

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell align="right">Сумма</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.userName} — {e.userEmail}</TableCell>
                  <TableCell align="right">{e.amount.toFixed(2)}</TableCell>
                  <TableCell>{e.description || '—'}</TableCell>
                  <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Button color="error" size="small" onClick={() => onDelete(e.id)}>
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && !loading && (
                <TableRow><TableCell colSpan={5}>Пока нет расходов</TableCell></TableRow>
              )}
              {loading && (
                <TableRow><TableCell colSpan={5}>Загрузка…</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </CenterCard>
  );
}
