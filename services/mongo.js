import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL);

await client.connect();

const database = client.db("thepulped");

export default database;