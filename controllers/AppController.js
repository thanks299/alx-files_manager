import dbClient from "../utils/db.js"
import redisClient from "../utils/redis.js"


const getStatus = async (req, res, next) => {
	const redis = redisClient.isAlive();
	const db = dbClient.isAlive();

	res.status(200).json({ redis, db });
}


const getStats = async (req, res, next) => {
	const users = await dbClient.nbUsers();
	const files = await dbClient.nbFiles();

	res.status(200).json({ users, files });
}


export default {
	getStatus,
	getStats,
}
