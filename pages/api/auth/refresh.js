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

export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            status: "failed",
            statusCode: 405,
            message: "Method not allowed"
        });

    }

    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== "string") {

        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Refresh token is required"
        });

    }

    try {

        const refreshTokenHash = hashToken(
            refreshToken
        );

        const user =
            await users.getUserByRefreshTokenHash(
                refreshTokenHash
            );

        if (!user) {

            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Invalid refresh token"
            });

        }

        if (
            !user.tokens ||
            !user.tokens.refresh ||
            !user.tokens.refresh.expiresAt
        ) {

            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Invalid refresh token"
            });

        }

        if (
            new Date(user.tokens.refresh.expiresAt) <=
            new Date()
        ) {

            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Refresh token expired"
            });

        }

        const accessToken = generateToken();

        const newRefreshToken = generateToken();

        const accessTokenHash = hashToken(
            accessToken
        );

        const newRefreshTokenHash = hashToken(
            newRefreshToken
        );

        const now = new Date();

        const accessTokenExpiresAt = new Date(
            now.getTime() +
            60 * 60 * 1000
        );

        const refreshTokenExpiresAt = new Date(
            now.getTime() +
            30 * 24 * 60 * 60 * 1000
        );

        await users.updateUser(
            {
                _id: user._id
            },
            {
                tokens: {
                    access: {
                        hash: accessTokenHash,
                        expiresAt: accessTokenExpiresAt
                    },
                    refresh: {
                        hash: newRefreshTokenHash,
                        expiresAt: refreshTokenExpiresAt
                    }
                },
                updatedAt: now
            }
        );

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt
        });

    } catch (error) {

        console.error("Refresh token error:", error);

        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Token refresh failed"
        });

    }

}