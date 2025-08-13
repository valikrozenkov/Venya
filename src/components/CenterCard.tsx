'use client';

import { Box, Paper, styled } from '@mui/material';
import * as React from 'react';

export default function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <StyledBox>
      <StyledPaper elevation={1}>
        {children}
      </StyledPaper>
    </StyledBox>
  );
}

const StyledBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  p: 3,
  width: '100%',
  maxWidth: 520,
  bgcolor: '#fff',
  padding: '24px',
}));

