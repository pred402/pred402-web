import { config } from "dotenv";
config({ path: ".env.local" });

import { auth } from "./packages/auth/auth.js";
import { createUser, createUserAccount, getUserByEmail } from "./packages/database/index.js";
import { nanoid } from "nanoid";

async function main() {
    console.log("Creating admin user...");
    
    const email = "admin@supastarter.dev";
    const name = "Super Admin";
    
    try {
        // Check if user exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            console.log("Admin user already exists!");
            return;
        }
        
        const authContext = await auth.$context;
        const adminPassword = "Admin123!@#";
        const hashedPassword = await authContext.password.hash(adminPassword);
        
        const adminUser = await createUser({
            email,
            name,
            role: "admin",
            emailVerified: true,
            onboardingComplete: true,
        });
        
        if (!adminUser) {
            console.error("Failed to create user!");
            return;
        }
        
        await createUserAccount({
            userId: adminUser.id,
            providerId: "credential",
            accountId: adminUser.id,
            hashedPassword,
        });
        
        console.log("✅ Admin user created successfully!");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log("🔗 Login URL: http://localhost:3001/auth/login");
        
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
}

main();
