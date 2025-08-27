import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple session alternative for development/production
// You can add proper session management later if needed
app.use((req, res, next) => {
	// Add basic request logging
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined = undefined;

	const originalResJson = res.json;
	res.json = function (bodyJson, ...args) {
		capturedJsonResponse = bodyJson;
		return originalResJson.apply(res, [bodyJson, ...args]);
	};

	res.on("finish", () => {
		const duration = Date.now() - start;
		if (path.startsWith("/api")) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + "…";
			}

			log(logLine);
		}
	});

	next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		database: "sqlite",
		platform: process.env.RENDER ? "render" : process.env.RAILWAY_ENVIRONMENT ? "railway" : "docker"
	});
});

(async () => {
	const server = await registerRoutes(app);

	// Error handling middleware
	app.use((err: any, req: Request, res: Response, next: NextFunction) => {
		const status = err.status || err.statusCode || 500;
		const message = err.message || "Internal Server Error";

		console.error(`Error ${status}: ${message}`);
		res.status(status).json({ message });
	});

	// Setup static file serving and Vite in development
	if (app.get("env") === "development") {
		await setupVite(app, server);
	} else {
		serveStatic(app);
	}

	// Start server
	const PORT = process.env.PORT || 3000;
	const HOST = "0.0.0.0";

	server.listen(PORT, HOST, () => {
		log(`Server running on ${HOST}:${PORT}`);
		log(`Health check: http://${HOST}:${PORT}/api/health`);
	});
})();
