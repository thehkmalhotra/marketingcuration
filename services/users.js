import database from "./mongo";

export default {

    async allUsers() {
        return database
            .collection("users")
            .find({})
            .toArray();
    },

    async getUser(id) {
        return database
            .collection("users")
            .findOne({
                _id: id
            });
    },

    async getUserByEmail(email) {
        return database
            .collection("users")
            .findOne({
                email
            });
    },

    async getUserByAccessTokenHash(hash) {
        return database
            .collection("users")
            .findOne({
                "tokens.access.hash": hash
            });
    },

    async getUserByRefreshTokenHash(hash) {
        return database
            .collection("users")
            .findOne({
                "tokens.refresh.hash": hash
            });
    },

    async createUser(user) {
        return database
            .collection("users")
            .insertOne(user);
    },

    async deleteUser(id) {
        return database
            .collection("users")
            .deleteOne({
                _id: id
            });
    },

    async updateUser(id, updatedUser) {
        return database
            .collection("users")
            .updateOne(
                {
                    _id: id
                },
                {
                    $set: updatedUser
                }
            );
    }

};