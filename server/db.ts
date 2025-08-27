import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { existsSync, mkdirSync } from "fs";

// Get proper database path based on platform
const getDatabasePath = () => {
	if (process.env.DATABASE_URL) {
		return process.env.DATABASE_URL;
	}

	// Default paths for different platforms
	if (process.env.RENDER) {
		return "/opt/render/project/src/database.sqlite";
	}

	if (process.env.RAILWAY_ENVIRONMENT) {
		return "./database.sqlite";
	}

	// Local development
	return "database.sqlite";
};

const dbPath = getDatabasePath();
console.log(`📁 Using database path: ${dbPath}`);

// Ensure directory exists for the database file
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
	console.log(`📁 Created database directory: ${dbDir}`);
}

const sqlite = new Database(dbPath);

// Enable foreign key constraints and optimize for better performance
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("cache_size = 1000");
sqlite.pragma("temp_store = memory");

// Create database connection
export const db = drizzle(sqlite, { schema });

// Initialize database schema manually if migrations fail
const initializeSchema = () => {
	try {
		// Create tables manually
		sqlite.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        note TEXT,
        date INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      );
    `);

		sqlite.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
        is_default TEXT NOT NULL DEFAULT 'false' CHECK (is_default IN ('true', 'false')),
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      );
    `);

		console.log("✅ Database schema created manually");
	} catch (error) {
		console.error("❌ Error creating schema:", error);
	}
};

// Try to run migrations, if that fails, initialize schema manually
try {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const migrationsFolder = path.join(dirname(__dirname), "migrations");

	if (existsSync(migrationsFolder)) {
		migrate(db, { migrationsFolder });
		console.log("✅ Database migrated successfully");
	} else {
		console.log("ℹ️  No migrations folder found, initializing schema manually");
		initializeSchema();
	}
} catch (error) {
	console.log("ℹ️  Migration failed, initializing schema manually");
	initializeSchema();
}

// Initialize default categories if they don't exist
const initializeDefaultCategories = async () => {
	try {
		const existingCategories = await db.select().from(schema.categories);

		if (existingCategories.length === 0) {
			const defaultCategories = [
				// Income categories
				{ key: "salary", label: "Зарплата", icon: "💰", color: "#10b981", type: "income", isDefault: "true" },
				{ key: "freelance", label: "Фриланс", icon: "💻", color: "#3b82f6", type: "income", isDefault: "true" },
				{ key: "investment", label: "Инвестиции", icon: "📈", color: "#8b5cf6", type: "income", isDefault: "true" },
				{ key: "gift", label: "Подарок", icon: "🎁", color: "#f59e0b", type: "income", isDefault: "true" },
				{ key: "other-income", label: "Другое", icon: "💵", color: "#6b7280", type: "income", isDefault: "true" },

				// Expense categories
				{ key: "food", label: "Еда", icon: "🍕", color: "#ef4444", type: "expense", isDefault: "true" },
				{ key: "transport", label: "Транспорт", icon: "🚗", color: "#f97316", type: "expense", isDefault: "true" },
				{ key: "housing", label: "Жильё", icon: "🏠", color: "#84cc16", type: "expense", isDefault: "true" },
				{ key: "utilities", label: "Коммунальные", icon: "💡", color: "#06b6d4", type: "expense", isDefault: "true" },
				{ key: "healthcare", label: "Здоровье", icon: "🏥", color: "#ec4899", type: "expense", isDefault: "true" },
				{ key: "entertainment", label: "Развлечения", icon: "🎮", color: "#a855f7", type: "expense", isDefault: "true" },
				{ key: "shopping", label: "Покупки", icon: "🛒", color: "#f59e0b", type: "expense", isDefault: "true" },
				{ key: "education", label: "Образование", icon: "📚", color: "#3b82f6", type: "expense", isDefault: "true" },
				{ key: "other-expense", label: "Другое", icon: "💸", color: "#6b7280", type: "expense", isDefault: "true" },
			];

			await db.insert(schema.categories).values(defaultCategories as any);
			console.log("✅ Default categories initialized");
		}
	} catch (error) {
		console.error("❌ Error initializing categories:", error);
	}
};

// Initialize categories on startup
initializeDefaultCategories().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
	console.log('📴 Closing database connection...');
	sqlite.close();
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('📴 Closing database connection...');
	sqlite.close();
	process.exit(0);
});

export default db;
