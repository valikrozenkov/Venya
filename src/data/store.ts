'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = { id: string; name: string; phone: string; email: string };
export type Expense = { id: string; userId: string; amount: number; description: string; createdAt: string };

type DataState = {
  users: User[];
  expenses: Expense[];
  addUser: (u: Omit<User, 'id'>) => Promise<void>;
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
};

const DataContext = createContext<DataState | null>(null);

const LS_KEY = 'demo-data-v1';

function load() {
  if (typeof window === 'undefined') return { users: [], expenses: [] };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { users: [], expenses: [] };
    return JSON.parse(raw) as { users: User[]; expenses: Expense[] };
  } catch {
    return { users: [], expenses: [] };
  }
}

function save(data: { users: User[]; expenses: Expense[] }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// Заглушка "отправки на бэк"
async function sendToBackend(endpoint: 'users' | 'expenses', payload: unknown) {
  // тут будет fetch('/api/...'), пока просто эмулируем задержку
  // console.log('Would POST to', endpoint, payload);
  await new Promise((r) => setTimeout(r, 250));
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const { users, expenses } = load();
    setUsers(users);
    setExpenses(expenses);
  }, []);

  useEffect(() => {
    save({ users, expenses });
  }, [users, expenses]);

  const value = useMemo<DataState>(() => ({
    users,
    expenses,
    addUser: async (u) => {
      const newUser: User = { id: crypto.randomUUID(), ...u };
      setUsers((prev) => [...prev, newUser]);
      await sendToBackend('users', newUser);
    },
    addExpense: async (e) => {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...e,
      };
      setExpenses((prev) => [...prev, newExpense]);
      await sendToBackend('expenses', newExpense);
    },
  }), [users, expenses]);

  return React.createElement(DataContext.Provider, { value, children });
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// Хелперы для статистики
export function calcUserTotal(expenses: Expense[], userId: string) {
  return expenses.filter((e) => e.userId === userId).reduce((s, e) => s + e.amount, 0);
}
export function calcGrandTotal(expenses: Expense[]) {
  return expenses.reduce((s, e) => s + e.amount, 0);
}
