import { type Transaction, type InsertTransaction, type Category, type InsertCategory, transactions, categories } from "@shared/schema";
import { eq, and, gte, lte, like, or } from "drizzle-orm";
import db from "./db";

export interface IStorage {
	// Transactions
	getTransactions(): Promise<Transaction[]>;
	getTransaction(id: string): Promise<Transaction | undefined>;
	createTransaction(transaction: InsertTransaction): Promise<Transaction>;
	updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
	deleteTransaction(id: string): Promise<boolean>;
	getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
	getTransactionsByCategory(category: string): Promise<Transaction[]>;
	getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]>;

	// Categories
	getCategories(): Promise<Category[]>;
	getCategory(id: string): Promise<Category | undefined>;
	getCategoryByKey(key: string): Promise<Category | undefined>;
	createCategory(category: InsertCategory): Promise<Category>;
	updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
	deleteCategory(id: string): Promise<boolean>;
	getCategoriesByType(type: "income" | "expense" | "both"): Promise<Category[]>;
}

export class SqliteStorage implements IStorage {
	// Transaction methods
	async getTransactions(): Promise<Transaction[]> {
		return await db.select().from(transactions).orderBy(transactions.date);
	}

	async getTransaction(id: string): Promise<Transaction | undefined> {
		const result = await db.select().from(transactions).where(eq(transactions.id, id));
		return result[0];
	}

	async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
		const result = await db.insert(transactions).values({
			...insertTransaction,
			date: insertTransaction.date,
		}).returning();
		return result[0];
	}

	async updateTransaction(id: string, updateData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
		const result = await db.update(transactions)
			.set(updateData)
			.where(eq(transactions.id, id))
			.returning();
		return result[0];
	}

	async deleteTransaction(id: string): Promise<boolean> {
		const result = await db.delete(transactions).where(eq(transactions.id, id));
		return result.changes > 0;
	}

	async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
		return await db.select()
			.from(transactions)
			.where(
				and(
					gte(transactions.date, startDate),
					lte(transactions.date, endDate)
				)
			)
			.orderBy(transactions.date);
	}

	async getTransactionsByCategory(category: string): Promise<Transaction[]> {
		return await db.select()
			.from(transactions)
			.where(eq(transactions.category, category))
			.orderBy(transactions.date);
	}

	async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
		return await db.select()
			.from(transactions)
			.where(eq(transactions.type, type))
			.orderBy(transactions.date);
	}

	// Category methods
	async getCategories(): Promise<Category[]> {
		return await db.select().from(categories).orderBy(categories.label);
	}

	async getCategory(id: string): Promise<Category | undefined> {
		const result = await db.select().from(categories).where(eq(categories.id, id));
		return result[0];
	}

	async getCategoryByKey(key: string): Promise<Category | undefined> {
		const result = await db.select().from(categories).where(eq(categories.key, key));
		return result[0];
	}

	async createCategory(insertCategory: InsertCategory): Promise<Category> {
		const result = await db.insert(categories).values(insertCategory).returning();
		return result[0];
	}

	async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
		const result = await db.update(categories)
			.set(updateData)
			.where(eq(categories.id, id))
			.returning();
		return result[0];
	}

	async deleteCategory(id: string): Promise<boolean> {
		// Check if it's a default category
		const category = await this.getCategory(id);
		if (!category || category.isDefault === "true") {
			return false;
		}

		const result = await db.delete(categories).where(eq(categories.id, id));
		return result.changes > 0;
	}

	async getCategoriesByType(type: "income" | "expense" | "both"): Promise<Category[]> {
		return await db.select()
			.from(categories)
			.where(
				or(
					eq(categories.type, type),
					eq(categories.type, "both")
				)
			)
			.orderBy(categories.label);
	}
}

export const storage = new SqliteStorage();
