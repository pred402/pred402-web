import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "./drizzle/schema/sqlite.ts",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
