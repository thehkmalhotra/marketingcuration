import users from "@/services/users";

export default async function handler(req, res) {

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            status: "failed",
            statusCode: 400,
            message: "User ID is required"
        });
    }

    if (req.method === "GET") {

        const user = await users.getUser(id);

        if (!user) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            user
        });
    }

    else if (req.method === "PUT") {

        const user = await users.updateUser(id, req.body);

        if (!user) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            user
        });
    }

    else if (req.method === "PATCH") {

        const user = await users.updateUser(id, req.body);

        if (!user) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            user
        });
    }

    else if (req.method === "DELETE") {

        const deleted = await users.deleteUser(id);

        if (!deleted) {
            return res.status(404).json({
                status: "failed",
                statusCode: 404,
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "User deleted successfully"
        });
    }

    return res.status(405).json({
        status: "failed",
        statusCode: 405,
        message: "Method not allowed"
    });
}