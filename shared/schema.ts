import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  note: text("note"),
  date: timestamp("date", { withTimezone: false }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).default(sql`now()`).notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").unique().notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type", { enum: ["income", "expense", "both"] }).notNull(),
  isDefault: text("is_default", { enum: ["true", "false"] }).default("false").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).default(sql`now()`).notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.number().positive("Сумма должна быть положительной"),
  description: z.string().min(1, "Описание обязательно"),
  category: z.string().min(1, "Категория обязательна"),
  date: z.date(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
