import { sql } from "drizzle-orm";
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = sqliteTable("transactions", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	type: text("type", { enum: ["income", "expense"] }).notNull(),
	description: text("description").notNull(),
	amount: real("amount").notNull(),
	category: text("category").notNull(),
	note: text("note"),
	date: integer("date", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const categories = sqliteTable("categories", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	key: text("key").unique().notNull(),
	label: text("label").notNull(),
	icon: text("icon").notNull(),
	color: text("color").notNull(),
	type: text("type", { enum: ["income", "expense", "both"] }).notNull(),
	isDefault: text("is_default", { enum: ["true", "false"] }).default("false").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
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
