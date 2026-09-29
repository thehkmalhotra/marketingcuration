import crypto from "crypto";

import users from "@/services/users";

function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

function checkPassword(password, storedPassword) {

    const hash = crypto.scryptSync(
        password,
        process.env.PASSWORD_SECRET,
        64
    );

    const storedHash = Buffer.from(
        storedPassword,
        "hex"
    );

    if (hash.length !== storedHash.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        hash,
        storedHash
    );
}

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            status: "failed",
            statusCode: 405,
            message: "Method not allowed"
        });
    }

    const { email, password } = req.body;

    if (!email || typeof email !== "string") {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Email is required"
        });
    }

    if (!password || typeof password !== "string") {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Password is required"
        });
    }

    const normalizedEmail = email
        .trim()
        .toLowerCase();

    if (!normalizedEmail.includes("@")) {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Invalid email"
        });
    }

    try {

        const user = await users.getUserByEmail(
            normalizedEmail
        );

        if (!user) {
            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Invalid email or password"
            });
        }

        const passwordValid = checkPassword(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Invalid email or password"
            });
        }

        const accessToken = generateToken();
        const refreshToken = generateToken();

        const accessTokenHash = hashToken(
            accessToken
        );

        const refreshTokenHash = hashToken(
            refreshToken
        );

        const now = new Date();

        const accessTokenExpiresAt = new Date(
            now.getTime() +
            60 * 60 * 1000
        );

        const refreshTokenExpiresAt = new Date(
            now.getTime() +
            365 * 24 * 60 * 60 * 1000
        );

        await users.updateUser(
            user._id,
            {
                tokens: {
                    access: {
                        hash: accessTokenHash,
                        expiresAt: accessTokenExpiresAt
                    },
                    refresh: {
                        hash: refreshTokenHash,
                        expiresAt: refreshTokenExpiresAt
                    }
                },
                updatedAt: now
            }
        );

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Login successful",
            accessToken: {
                accessToken,
                accessTokenExpiresAt,
            },
            refreshToken: {
                refreshToken,
                refreshTokenExpiresAt
            }
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Login failed"
        });
    }
}