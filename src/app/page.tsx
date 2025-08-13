'use client';

import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import CenterCard from '@/components/CenterCard';
import { useData } from '@/data/store';
import Link from 'next/link';

export default function PageUsers() {
  const { addUser } = useData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;
  
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim() }),
    });
  
    if (!res.ok) {
      return;
    }
  
    setName(''); setPhone(''); setEmail('');
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
    </CenterCard>
  );
}
