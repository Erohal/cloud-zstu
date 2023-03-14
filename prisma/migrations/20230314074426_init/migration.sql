-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "academic" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idcard" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cookie" JSONB NOT NULL,
    "password" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL DEFAULT 'anonymous',
    "kcbh" INTEGER NOT NULL,
    "kcmc" TEXT NOT NULL,
    "kclbmc" TEXT NOT NULL,
    "kcxzmc" TEXT NOT NULL,
    "rkls" TEXT[],
    "xn" INTEGER NOT NULL,
    "xq" INTEGER NOT NULL,
    "xf" DOUBLE PRECISION NOT NULL,
    "cj" TEXT NOT NULL,
    "bfzcj" INTEGER NOT NULL,
    "jd" DOUBLE PRECISION NOT NULL,
    "xfjd" DOUBLE PRECISION NOT NULL,
    "md5" TEXT NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_student_id_key" ON "users"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_userId_key" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "records_md5_key" ON "records"("md5");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("student_id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
