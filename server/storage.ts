import { type Transaction, type InsertTransaction, type Category, type InsertCategory } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private categories: Map<string, Category>;

  constructor() {
    this.transactions = new Map();
    this.categories = new Map();
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      // Расходы
      { key: "food", label: "Еда", icon: "fas fa-shopping-cart", color: "bg-orange-100 text-orange-800", type: "expense", isDefault: "true" },
      { key: "transport", label: "Транспорт", icon: "fas fa-subway", color: "bg-purple-100 text-purple-800", type: "expense", isDefault: "true" },
      { key: "utilities", label: "Коммунальные", icon: "fas fa-home", color: "bg-blue-100 text-blue-800", type: "expense", isDefault: "true" },
      { key: "entertainment", label: "Развлечения", icon: "fas fa-gamepad", color: "bg-pink-100 text-pink-800", type: "expense", isDefault: "true" },
      { key: "healthcare", label: "Здоровье", icon: "fas fa-medkit", color: "bg-red-100 text-red-800", type: "expense", isDefault: "true" },
      { key: "shopping", label: "Покупки", icon: "fas fa-shopping-bag", color: "bg-indigo-100 text-indigo-800", type: "expense", isDefault: "true" },
      { key: "education", label: "Образование", icon: "fas fa-graduation-cap", color: "bg-yellow-100 text-yellow-800", type: "expense", isDefault: "true" },
      
      // Доходы
      { key: "salary", label: "Зарплата", icon: "fas fa-money-bill-wave", color: "bg-green-100 text-green-800", type: "income", isDefault: "true" },
      { key: "freelance", label: "Фриланс", icon: "fas fa-laptop-code", color: "bg-green-100 text-green-800", type: "income", isDefault: "true" },
      { key: "business", label: "Бизнес", icon: "fas fa-briefcase", color: "bg-green-100 text-green-800", type: "income", isDefault: "true" },
      { key: "investment", label: "Инвестиции", icon: "fas fa-chart-line", color: "bg-green-100 text-green-800", type: "income", isDefault: "true" },
      { key: "gift", label: "Подарок", icon: "fas fa-gift", color: "bg-green-100 text-green-800", type: "income", isDefault: "true" },
      { key: "other", label: "Прочее", icon: "fas fa-question-circle", color: "bg-gray-100 text-gray-800", type: "both", isDefault: "true" },
    ];

    defaultCategories.forEach(cat => {
      const id = randomUUID();
      const category: Category = {
        ...cat,
        id,
        createdAt: new Date(),
      };
      this.categories.set(id, category);
    });
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      createdAt: new Date(),
      note: insertTransaction.note || null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updateData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = {
      ...existing,
      ...updateData,
      amount: updateData.amount ? updateData.amount.toString() : existing.amount,
    };
    
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(t => t.category === category);
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(t => t.type === type);
  }

  // Categories methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByKey(key: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.key === key);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated: Category = {
      ...existing,
      ...updateData,
    };
    
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = this.categories.get(id);
    if (!category || category.isDefault === "true") {
      return false; // Cannot delete default categories
    }
    return this.categories.delete(id);
  }

  async getCategoriesByType(type: "income" | "expense" | "both"): Promise<Category[]> {
    const categories = await this.getCategories();
    return categories.filter(c => c.type === type || c.type === "both");
  }
}

export const storage = new MemStorage();
