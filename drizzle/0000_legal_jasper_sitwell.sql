CREATE TABLE "educations" (
	"id" serial PRIMARY KEY NOT NULL,
	"school" text NOT NULL,
	"period" text NOT NULL,
	"title_fr" text NOT NULL,
	"title_en" text NOT NULL,
	"detail_fr" text,
	"detail_en" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"period" text NOT NULL,
	"role_fr" text NOT NULL,
	"role_en" text NOT NULL,
	"bullets_fr" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bullets_en" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title_fr" text NOT NULL,
	"title_en" text NOT NULL,
	"about_fr" text NOT NULL,
	"about_en" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text,
	"socials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cv_pdf_url" text,
	"photo_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_fr" text NOT NULL,
	"title_en" text NOT NULL,
	"desc_fr" text NOT NULL,
	"desc_en" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_url" text,
	"live_url" text,
	"repo_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
