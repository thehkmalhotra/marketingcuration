import crypto from "crypto";

import users from "@/services/users";
import { createPage } from "@/services/playwright";
import { encrypt } from "@/services/encryption";

function generatePassword() {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let password = "";

    for (let i = 0; i < 10; i++) {
        password += characters[
            crypto.randomInt(0, characters.length)
        ];
    }

    return password;
}

function hashPassword(password) {
    return crypto.scryptSync(
        password,
        process.env.PASSWORD_SECRET,
        64
    ).toString("hex");
}

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const { fullName, email } = req.body;

    if (!fullName || typeof fullName !== "string") {
        return res.status(400).json({
            success: false,
            message: "Full name is required"
        });
    }

    if (!email || typeof email !== "string") {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
        return res.status(400).json({
            success: false,
            message: "Full name must be at least 2 characters"
        });
    }

    if (!normalizedEmail.includes("@")) {
        return res.status(400).json({
            success: false,
            message: "Invalid email"
        });
    }

    let context;

    try {

        const existingUser = await users.getUserByEmail(
            normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const result = await createPage();

        const page = result.page;
        context = result.context;

        await page.goto(
            "https://www.instagram.com/accounts/login/",
            {
                waitUntil: "domcontentloaded"
            }
        );

        const timeout = Date.now() + 5 * 60 * 1000;

        let authenticated = false;

        while (Date.now() < timeout) {

            const cookies = await context.cookies();

            authenticated = cookies.some(
                cookie => cookie.name === "sessionid"
            );

            if (authenticated) {
                break;
            }

            await new Promise(resolve => {
                setTimeout(resolve, 2000);
            });
        }

        if (!authenticated) {
            return res.status(408).json({
                success: false,
                message: "Instagram authentication timed out"
            });
        }

        const storageState = await context.storageState();

        const encryptedStorage = encrypt(
            JSON.stringify(storageState)
        );

        const password = generatePassword();

        const passwordHash = hashPassword(password);

        const user = await users.createUser({
            fullName: normalizedName,
            email: normalizedEmail,
            password: passwordHash,
            instagramStorage: encryptedStorage,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log("Temporary password:", password);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            userId: user.insertedId
        });

    } catch (error) {

        console.error(
            "Create account error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Account creation failed"
        });

    } finally {

        if (context) {
            await context.close();
        }

    }
}