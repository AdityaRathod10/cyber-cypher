import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Papa from 'papaparse';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define interface for the CSV data structure
interface SalesData {
  date: string;
  amount: string;
  [key: string]: string; // For any additional columns
}

export async function parseCSV(file: File): Promise<SalesData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<SalesData>(file, {
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

export function calculateTotalSales(data: SalesData[]): number {
  return data.reduce((total, row) => total + (parseFloat(row.amount) || 0), 0);
}

// Interface for grouped data
interface GroupedSalesData {
  month: string;
  total: number;
  count: number;
}

export function groupDataByMonth(data: SalesData[]): GroupedSalesData[] {
  const groupedData = data.reduce<Record<string, GroupedSalesData>>((acc, row) => {
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