-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('POLICY', 'SOP', 'ARCHITECTURE', 'TECHNICAL_DOC', 'HR_GUIDELINES', 'TRAINING_MATERIAL', 'COMPLIANCE');

-- AlterTable
ALTER TABLE "knowledge_docs" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "category" "KnowledgeCategory" NOT NULL,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "searchVector" tsvector,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '1.0';

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_docs_slug_key" ON "knowledge_docs"("slug");

-- AddForeignKey
ALTER TABLE "knowledge_docs" ADD CONSTRAINT "knowledge_docs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX knowledge_docs_search_idx ON knowledge_docs USING GIN ("searchVector");
