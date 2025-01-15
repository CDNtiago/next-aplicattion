import { PrismaClient } from '@prisma/client';
import { formatCurrency } from './utils';
import { Chart } from 'chart.js';
const prisma = new PrismaClient();

// Função para buscar as receitas
export async function fetchRevenue() {
  try {
    const data = await prisma.revenue.findMany({
      orderBy: {
        month: 'asc'
      }
    });

    return data;  // Retorna os dados brutos para processar no componente
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// Função para buscar as últimas faturas
export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      select: {
        amount: true,
        customer: {
          select: {
            name: true,
            image_url: true,
            email: true,
          },
        },
        id: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    });

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// Função para buscar dados das estatísticas (clientes, faturas e status)
export async function fetchCardData() {
  try {
    const invoiceCountPromise = prisma.invoice.count();
    const customerCountPromise = prisma.customer.count();
    const invoiceStatusPromise = prisma.invoice.groupBy({
      by: ['status'],
      _sum: {
        amount: true,
      },
    });

    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const totalPaid = invoiceStatus.find((status) => status.status === 'paid')?._sum.amount ?? 0;
    const totalPending = invoiceStatus.find((status) => status.status === 'pending')?._sum.amount ?? 0;

    return {
      numberOfCustomers: customerCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices: formatCurrency(totalPaid),
      totalPendingInvoices: formatCurrency(totalPending),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

// Função para buscar faturas filtradas por query
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
            image_url: true,
          },
        },
      },
      where: {
        OR: [
          { customer: { name: { contains: query } } },
          { customer: { email: { contains: query } } },
          { amount: { equals: parseFloat(query) || undefined } },
          { status: { contains: query } },
        ],
      },
      orderBy: {
        date: 'desc',
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

// Função para buscar o número total de páginas de faturas
export async function fetchInvoicesPages(query: string) {
  try {
    const count = await prisma.invoice.count({
      where: {
        OR: [
          { customer: { name: { contains: query } } },
          { customer: { email: { contains: query } } },
          { amount: { equals: parseFloat(query) || undefined } },
          { status: { contains: query } },
        ],
      },
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

// Função para buscar fatura por ID
export async function fetchInvoiceById(id: string) {
  try {
    const data = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        customer_id: true,
        amount: true,
        status: true,
      },
    });

    if (!data) throw new Error('Invoice not found');

    return {
      ...data,
      // Convert amount from cents to dollars
      amount: data.amount / 100,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

// Função para buscar todos os clientes
export async function fetchCustomers() {
  try {
    const data = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

// Função para buscar clientes filtrados
export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image_url: true,
        invoices: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });

    const customers = data.map((customer) => ({
      ...customer,
      total_invoices: customer.invoices.length,
      total_pending: formatCurrency(
        customer.invoices.filter((inv) => inv.status === 'pending').reduce((acc, inv) => acc + inv.amount, 0)
      ),
      total_paid: formatCurrency(
        customer.invoices.filter((inv) => inv.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0)
      ),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
