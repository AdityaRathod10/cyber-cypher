import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Papa from 'papaparse';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateTotalSales(data: any[]): number {
  return data.reduce((total, row) => total + (parseFloat(row.amount) || 0), 0);
}

export function groupDataByMonth(data: any[]): any[] {
  const groupedData = data.reduce((acc: any, row) => {
    const date = new Date(row.date);
    if (!isNaN(date.getTime())) {
      const month = date.toLocaleString('default', { month: 'long' });
      if (!acc[month]) {
        acc[month] = { month, total: 0, count: 0 };
      }
      acc[month].total += parseFloat(row.amount) || 0;
      acc[month].count += 1;
    }
    return acc;
  }, {});

  return Object.values(groupedData);
}