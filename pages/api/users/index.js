import users from "@/services/users";

export default async function handler(req, res) {

    if (req.method === "GET") {

        const allUsers = await users.allUsers();

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            allUsers
        });
    }

    else if (req.method === "POST") {

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: "failed",
                statusCode: 400,
                message: "User data is required"
            });
        }

        const user = await users.createUser(req.body);

        return res.status(201).json({
            status: "success",
            statusCode: 201,
            user
        });
    }

    return res.status(405).json({
        status: "failed",
        statusCode: 405,
        message: "Method not allowed"
    });
}