// lib/queue.ts

'use client';

const QUEUE_KEY = 'asset_tracker_queue';
const RETRY_INTERVAL_MS = 10_000;

export interface QueueEntry {
  id: string;
  endpoint: string;
  payload: Record<string, unknown>;
  enqueuedAt: number;
  attempts: number;
}

export function enqueue(endpoint: string, payload: Record<string, unknown>): void {
  const entry: QueueEntry = {
    id: crypto.randomUUID(),
    endpoint,
    payload,
    enqueuedAt: Date.now(),
    attempts: 0,
  };
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);
}

export function readQueue(): QueueEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as QueueEntry[];
  } catch {
    return [];
  }
}

export function writeQueue(queue: QueueEntry[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function removeFromQueue(id: string): void {
  const queue = readQueue().filter((e) => e.id !== id);
  writeQueue(queue);
}

async function flushQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  for (const entry of queue) {
    try {
      const res = await fetch(entry.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry.payload),
      });

      if (res.ok) {
        removeFromQueue(entry.id);
      } else {
        bumpAttempts(entry.id);
      }
    } catch {
      bumpAttempts(entry.id);
    }
  }
}

function bumpAttempts(id: string): void {
  const queue = readQueue().map((e) =>
    e.id === id ? { ...e, attempts: e.attempts + 1 } : e
  );
  writeQueue(queue);
}

let retryLoopStarted = false;

export function startRetryLoop(): void {
  if (retryLoopStarted || typeof window === 'undefined') return;
  retryLoopStarted = true;
  setInterval(flushQueue, RETRY_INTERVAL_MS);
}