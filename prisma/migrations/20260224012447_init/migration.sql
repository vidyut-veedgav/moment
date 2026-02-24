-- CreateEnum
CREATE TYPE "MomentStatus" AS ENUM ('PENDING', 'BOTH_RESPONDED', 'REVEALED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('PENDING', 'RESPONDED');

-- CreateTable
CREATE TABLE "partners" (
    "partner_id" UUID NOT NULL,
    "auth_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("partner_id")
);

-- CreateTable
CREATE TABLE "partnerships" (
    "partnership_id" UUID NOT NULL,
    "partner1_id" UUID NOT NULL,
    "partner2_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("partnership_id")
);

-- CreateTable
CREATE TABLE "prompts" (
    "prompt_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("prompt_id")
);

-- CreateTable
CREATE TABLE "partnership_prompts" (
    "partnership_id" UUID NOT NULL,
    "prompt_id" UUID NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnership_prompts_pkey" PRIMARY KEY ("partnership_id","prompt_id")
);

-- CreateTable
CREATE TABLE "moments" (
    "moment_id" UUID NOT NULL,
    "prompt_id" UUID NOT NULL,
    "partnership_id" UUID NOT NULL,
    "status" "MomentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moments_pkey" PRIMARY KEY ("moment_id")
);

-- CreateTable
CREATE TABLE "responses" (
    "response_id" UUID NOT NULL,
    "responder_id" UUID NOT NULL,
    "moment_id" UUID NOT NULL,
    "content" TEXT,
    "status" "ResponseStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responses_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "reveal_statuses" (
    "partner_id" UUID NOT NULL,
    "moment_id" UUID NOT NULL,
    "has_revealed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reveal_statuses_pkey" PRIMARY KEY ("partner_id","moment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_auth_id_key" ON "partners"("auth_id");

-- CreateIndex
CREATE INDEX "partnerships_partner1_id_idx" ON "partnerships"("partner1_id");

-- CreateIndex
CREATE INDEX "partnerships_partner2_id_idx" ON "partnerships"("partner2_id");

-- CreateIndex
CREATE UNIQUE INDEX "partnerships_partner1_id_partner2_id_key" ON "partnerships"("partner1_id", "partner2_id");

-- CreateIndex
CREATE INDEX "partnership_prompts_partnership_id_idx" ON "partnership_prompts"("partnership_id");

-- CreateIndex
CREATE INDEX "moments_partnership_id_idx" ON "moments"("partnership_id");

-- CreateIndex
CREATE INDEX "moments_created_at_idx" ON "moments"("created_at");

-- CreateIndex
CREATE INDEX "responses_moment_id_idx" ON "responses"("moment_id");

-- CreateIndex
CREATE UNIQUE INDEX "responses_responder_id_moment_id_key" ON "responses"("responder_id", "moment_id");

-- CreateIndex
CREATE INDEX "reveal_statuses_moment_id_idx" ON "reveal_statuses"("moment_id");

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_partner1_id_fkey" FOREIGN KEY ("partner1_id") REFERENCES "partners"("partner_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_partner2_id_fkey" FOREIGN KEY ("partner2_id") REFERENCES "partners"("partner_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_prompts" ADD CONSTRAINT "partnership_prompts_partnership_id_fkey" FOREIGN KEY ("partnership_id") REFERENCES "partnerships"("partnership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_prompts" ADD CONSTRAINT "partnership_prompts_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("prompt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moments" ADD CONSTRAINT "moments_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompts"("prompt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moments" ADD CONSTRAINT "moments_partnership_id_fkey" FOREIGN KEY ("partnership_id") REFERENCES "partnerships"("partnership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "partners"("partner_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responses" ADD CONSTRAINT "responses_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "moments"("moment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reveal_statuses" ADD CONSTRAINT "reveal_statuses_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("partner_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reveal_statuses" ADD CONSTRAINT "reveal_statuses_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "moments"("moment_id") ON DELETE CASCADE ON UPDATE CASCADE;
