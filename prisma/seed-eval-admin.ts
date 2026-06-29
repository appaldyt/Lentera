import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@ias.id' },
    update: {
      password: 'password123', // Using plaintext fallback supported by auth.ts
      role: 'EVALUATION_ADMIN',
      status: 'AKTIF'
    },
    create: {
      email: 'admin@ias.id',
      name: 'Admin Evaluasi',
      password: 'password123', 
      role: 'EVALUATION_ADMIN',
      status: 'AKTIF'
    }
  })

  await prisma.user.upsert({
    where: { email: 'evaluator@ias.id' },
    update: {
      password: 'password123',
      role: 'EVALUATOR',
      status: 'AKTIF'
    },
    create: {
      email: 'evaluator@ias.id',
      name: 'Evaluator Dummy',
      password: 'password123',
      role: 'EVALUATOR',
      status: 'AKTIF'
    }
  })

  console.log('Berhasil membuat akun Evaluasi!')
  console.log('Email: admin@ias.id | Password: password123 (Akses Admin)')
  console.log('Email: evaluator@ias.id | Password: password123 (Akses Evaluator)')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
