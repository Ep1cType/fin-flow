import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, type InsertTransaction } from "@shared/schema";
import { z } from "zod";

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all transactions with optional filtering
  app.get("/api/transactions", async (req, res) => {
    try {
      const query = querySchema.parse(req.query);
      let transactions = await storage.getTransactions();

      // Apply filters
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        transactions = transactions.filter(t => 
          t.description.toLowerCase().includes(searchLower) ||
          (t.note && t.note.toLowerCase().includes(searchLower))
        );
      }

      if (query.category) {
        transactions = transactions.filter(t => t.category === query.category);
      }

      if (query.type) {
        transactions = transactions.filter(t => t.type === query.type);
      }

      if (query.startDate && query.endDate) {
        const startDate = new Date(query.startDate);
        const endDate = new Date(query.endDate);
        transactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }

      if (query.minAmount) {
        const minAmount = parseFloat(query.minAmount);
        transactions = transactions.filter(t => parseFloat(t.amount) >= minAmount);
      }

      if (query.maxAmount) {
        const maxAmount = parseFloat(query.maxAmount);
        transactions = transactions.filter(t => parseFloat(t.amount) <= maxAmount);
      }

      res.json(transactions);
    } catch (error) {
      res.status(400).json({ message: "Ошибка валидации параметров запроса" });
    }
  });

  // Get transaction by ID
  app.get("/api/transactions/:id", async (req, res) => {
    const transaction = await storage.getTransaction(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }
    res.json(transaction);
  });

  // Create new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
      });
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ошибка валидации данных",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  });

  // Update transaction
  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const data = insertTransactionSchema.partial().parse({
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      });
      const transaction = await storage.updateTransaction(req.params.id, data);
      if (!transaction) {
        return res.status(404).json({ message: "Транзакция не найдена" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ошибка валидации данных",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  });

  // Delete transaction
  app.delete("/api/transactions/:id", async (req, res) => {
    const deleted = await storage.deleteTransaction(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }
    res.status(204).send();
  });

  // Get financial summary
  app.get("/api/summary", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
      });

      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const balance = transactions.reduce((sum, t) => {
        return t.type === "income" 
          ? sum + parseFloat(t.amount) 
          : sum - parseFloat(t.amount);
      }, 0);

      const incomeTransactionCount = monthlyTransactions.filter(t => t.type === "income").length;
      const expenseTransactionCount = monthlyTransactions.filter(t => t.type === "expense").length;

      res.json({
        balance,
        monthlyIncome,
        monthlyExpenses,
        incomeTransactionCount,
        expenseTransactionCount,
        totalTransactions: transactions.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Ошибка при получении сводки" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
