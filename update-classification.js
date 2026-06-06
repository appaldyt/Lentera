const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  await prisma.training.updateMany({
    where: { name: 'Global Strategic Accelaration Bootcamp' },
    data: { classification: 'Leadership Program' }
  });
  console.log('Updated');
}
main().catch(console.error).finally(() => prisma.$disconnect());
