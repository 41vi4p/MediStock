import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function isExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

export function isExpiringSoon(expiryDate: Date, daysThreshold: number = 30): boolean {
  const now = new Date();
  const threshold = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));
  return expiryDate <= threshold && expiryDate > now;
}

export function getDaysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}