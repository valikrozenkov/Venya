'use client';

import { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import CenterCard from '@/components/CenterCard';
import { useData } from '@/data/store';
import Link from 'next/link';

type User = { id: string; name: string; email: string };

export default function PageExpense() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');

  const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  fetch('/api/users')
    .then(r => r.json())
    .then(setUsers)
    .catch(() => setUsers([]));
}, []);

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
    </CenterCard>
  );
}
