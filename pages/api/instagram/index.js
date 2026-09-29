import crypto from "crypto";

import users from "@/services/users";
import { createContext } from "@/services/playwright";
import { decrypt } from "@/services/encryption";

function hashToken(token) {

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

}

export default async function handler(req, res) {

    if (req.method !== "GET") {

        return res.status(405).json({
            status: "failed",
            statusCode: 405,
            message: "Method not allowed"
        });

    }

    const { username } = req.query;

    if (!username || typeof username !== "string") {

        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "Instagram username is required"
        });

    }

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {

        return res.status(401).json({
            status: "failed",
            statusCode: 401,
            message: "Unauthorized"
        });

    }

    let context;

    try {

        // 1. Find logged-in GrowYaara user

        const accessTokenHash = hashToken(
            accessToken
        );

        const user = await users.getUserByAccessTokenHash(
            accessTokenHash
        );

        if (!user) {

            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Unauthorized"
            });

        }

        // 2. Check access token expiry

        if (
            !user.tokens ||
            !user.tokens.access ||
            !user.tokens.access.expiresAt
        ) {

            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Unauthorized"
            });

        }

        if (
            new Date(user.tokens.access.expiresAt) <=
            new Date()
        ) {

            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Access token expired"
            });

        }

        // 3. Check Instagram storage

        if (!user.instagramStorage) {

            return res.status(400).json({
                status: "failed",
                statusCode: 400,
                message: "Instagram is not connected"
            });

        }

        // 4. Decrypt Instagram storage

        let storageState = decrypt(
            user.instagramStorage
        );

        // Your current create route encrypts
        // JSON.stringify(storageState), so decrypt()
        // returns a JSON string.

        if (typeof storageState === "string") {
            storageState = JSON.parse(storageState);
        }

        // 5. Create Playwright context with user's Instagram cookies

        context = await createContext({
            storageState
        });

        const page = await context.newPage();

        // 6. First check Instagram authentication

        await page.goto(
            "https://www.instagram.com/",
            {
                waitUntil: "domcontentloaded"
            }
        );

        const cookies = await context.cookies();

        const instagramSession = cookies.find(
            cookie => cookie.name === "sessionid"
        );

        if (!instagramSession || !instagramSession.value) {

            return res.status(401).json({
                status: "failed",
                statusCode: 401,
                message: "Instagram session expired",
                reconnectRequired: true
            });

        }

        // 7. Now make the actual Instagram request

        const profileUrl =
            `https://www.instagram.com/${encodeURIComponent(username.trim())}/`;

        await page.goto(
            profileUrl,
            {
                waitUntil: "domcontentloaded"
            }
        );

        // Give Instagram a little time to render profile data

        await page.waitForTimeout(2000);

        // 8. Get username and followers

        const profileData = await page.evaluate(() => {

            const metaDescription =
                document.querySelector(
                    'meta[name="description"]'
                );

            const description =
                metaDescription?.getAttribute("content") || "";

            return {
                description
            };

        });

        const description = profileData.description;

        let followers = null;

        const followersMatch = description.match(
            /([\d,.]+[KMB]?)\s+Followers/i
        );

        if (followersMatch) {
            followers = followersMatch[1];
        }

        // 9. Get posts

        const posts = await page.evaluate(() => {

            const links = Array.from(
                document.querySelectorAll(
                    'a[href*="/p/"], a[href*="/reel/"], a[href*="/tv/"]'
                )
            );

            const uniquePosts = [];

            for (const link of links) {

                const href = link.href;

                if (!uniquePosts.includes(href)) {
                    uniquePosts.push(href);
                }

                if (uniquePosts.length === 30) {
                    break;
                }
            }

            return uniquePosts;

        });

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            data: {
                username: username.trim(),
                followers,
                posts
            }
        });

    } catch (error) {

        console.error(
            "Instagram scrape error:",
            error
        );

        return res.status(500).json({
            status: "failed",
            statusCode: 500,
            message: "Instagram scraping failed"
        });

    } finally {

        if (context) {
            await context.close();
        }

    }

}