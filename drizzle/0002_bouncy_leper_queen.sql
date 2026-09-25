ALTER TABLE "educations" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;