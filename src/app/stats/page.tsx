'use client';

import { useMemo, useState, useEffect } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack, Button } from '@mui/material';
import CenterCard from '@/components/CenterCard';
import { useData, calcGrandTotal, calcUserTotal } from '@/data/store';
import Link from 'next/link';

type Row = { userId: string; name: string; total: number };

export default function PageStats() {
  const { users, expenses } = useData();

  const [rows, setRows] = useState<Row[]>([]);
  const [grand, setGrand] = useState(0);
  
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((d) => { setRows(d.rows); setGrand(d.grand); })
      .catch(() => { setRows([]); setGrand(0); });
  }, []);

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
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.userId}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>Итого по всем</strong></TableCell>
                <TableCell align="right"><strong>{grand.toFixed(2)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" gap={1}>
          <Button component={Link} href="/">← Пользователи</Button>
          <Button component={Link} href="/expense">→ Добавить расход</Button>
        </Stack>
      </Stack>
    </CenterCard>
  );
}
