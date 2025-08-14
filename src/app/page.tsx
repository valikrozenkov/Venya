'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Stack, TextField, Typography,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import CenterCard from '@/components/CenterCard';
import Link from 'next/link';

type UserRow = { id: string; name: string; phone: string; email: string; createdAt?: string };

export default function PageUsers() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim() }),
    });

    if (!res.ok) return;

    setName(''); setPhone(''); setEmail('');
    loadUsers();
  }

  async function onDeleteUser(id: string) {
    const prev = users;
    setUsers(list => list.filter(u => u.id !== id));

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setUsers(prev);
        const msg = await res.json().then(d => d?.error).catch(() => null);
        alert(msg || 'Не удалось удалить пользователя');
      }
    } catch {
      setUsers(prev);
      alert('Не удалось удалить пользователя');
    }
  }

  return (
    <CenterCard>
      <Stack component="form" onSubmit={onSubmit} spacing={2}>
        <Typography variant="h6">Добавить пользователя</Typography>
        <TextField label="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <TextField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Box display="flex" gap={1}>
          <Button type="submit" variant="contained">Сохранить</Button>
          <Button component={Link} href="/expense" variant="outlined">→ Ко 2 странице</Button>
          <Button component={Link} href="/stats" variant="text">Статистика</Button>
        </Box>
      </Stack>

      {/* список пользователей */}
      <Stack mt={4} spacing={1}>
        <Typography variant="h6">Пользователи</Typography>

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell align="center">
                    <Button color="error" size="small" onClick={() => onDeleteUser(u.id)}>
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow><TableCell colSpan={4}>Пока нет пользователей</TableCell></TableRow>
              )}
              {loading && (
                <TableRow><TableCell colSpan={4}>Загрузка…</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </CenterCard>
  );
}
