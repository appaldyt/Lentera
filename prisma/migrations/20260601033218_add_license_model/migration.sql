-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "employeeStatus" TEXT NOT NULL,
    "lob" TEXT NOT NULL,
    "licenseName" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL DEFAULT '-',
    "category" TEXT NOT NULL DEFAULT 'Operasional',
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);
