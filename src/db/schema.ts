import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Bilingual content lives in side-by-side `*Fr` / `*En` columns (no translation
 * table). Every content table carries an integer `order` for drag-and-drop
 * reordering in the admin.
 */

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  location: text("location"),
  period: text("period").notNull(),
  roleFr: text("role_fr").notNull(),
  roleEn: text("role_en").notNull(),
  bulletsFr: jsonb("bullets_fr").$type<string[]>().notNull().default([]),
  bulletsEn: jsonb("bullets_en").$type<string[]>().notNull().default([]),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const educations = pgTable("educations", {
  id: serial("id").primaryKey(),
  school: text("school").notNull(),
  period: text("period").notNull(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  detailFr: text("detail_fr"),
  detailEn: text("detail_en"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** category ∈ 'stack' | 'fonctionnel' | 'qualite' */
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  descFr: text("desc_fr").notNull(),
  descEn: text("desc_en").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url"),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  featured: boolean("featured").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SocialLink = { label: string; url: string };

/** Single-row table holding the site owner's profile. */
export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  aboutFr: text("about_fr").notNull(),
  aboutEn: text("about_en").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  socials: jsonb("socials").$type<SocialLink[]>().notNull().default([]),
  cvPdfUrl: text("cv_pdf_url"),
  photoUrl: text("photo_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Experience = typeof experiences.$inferSelect;
export type Education = typeof educations.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Profile = typeof profile.$inferSelect;
