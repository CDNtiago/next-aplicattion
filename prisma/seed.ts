import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('senha123', 10)
  
  await prisma.user.create({
    data: {
      name: 'tirrasgo',
      email: 'tiago@teste.com',
      password: hashedPassword,
    },
  })

  await prisma.revenue.createMany({
    data: [
      { month: 'Jan', revenue: 1000, year: 2024 },
      { month: 'Feb', revenue: 1500, year: 2024 },
      { month: 'Mar', revenue: 1200, year: 2024 },
      { month: 'Apr', revenue: 1700, year: 2024 },
      { month: 'May', revenue: 1600, year: 2024 },
      { month: 'Jun', revenue: 1800, year: 2024 },
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