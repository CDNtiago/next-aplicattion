import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('senha123', 10)
  
  await prisma.user.create({
    data: {
      name: 'tirrasgo',
      email: 'tiago@example.com',
      password: hashedPassword,
    },
  })

  // Create customers first
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        image_url: '/customers/john.png',
      },
      {
        name: 'Alice Smith',
        email: 'alice@example.com',
        image_url: '/customers/alice.png',
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        image_url: '/customers/bob.png',
      },
    ],
  })

  // Get all customers to reference their IDs
  const allCustomers = await prisma.customer.findMany()

  // Create invoices
  await prisma.invoice.createMany({
    data: [
      {
        customer_id: allCustomers[0].id,
        amount: 15000, // $150.00
        status: 'pending',
        date: new Date('2024-03-01'),
      },
      {
        customer_id: allCustomers[1].id,
        amount: 20000, // $200.00
        status: 'paid',
        date: new Date('2024-03-02'),
      },
      {
        customer_id: allCustomers[2].id,
        amount: 25000, // $250.00
        status: 'paid',
        date: new Date('2024-03-03'),
      },
    ],
  })

  await prisma.revenue.createMany({
    data: [
      { month: 'Jan', revenue: 1100, year: 2024 },
      { month: 'Feb', revenue: 1400, year: 2024 },
      { month: 'Mar', revenue: 1300, year: 2024 },
      { month: 'Apr', revenue: 1800, year: 2024 },
      { month: 'May', revenue: 1700, year: 2024 },
      { month: 'Jun', revenue: 2000, year: 2024 },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })