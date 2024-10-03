import dbClient from '../utils/db';
import sha1 from "sha1";
import { ObjectID } from 'mongodb';
import redisClient from '../utils/redis';


const postNew = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	if (!email) {
		return res.status(400).json({ error: "Missing email" });
	}

	if (!password) {
		return res.status(400).json({ error: "Missing password" });
	}

	const activeEmail = await dbClient.db.collection("users").findOne({ email });
	if (activeEmail) {
		return res.status(400).json({ error: "Already exist" });
	}

	const hashPassword = sha1(password);

	const result = await dbClient.db.collection("users").insertOne({ email, password: hashPassword });

	res.status(201).json({
		id: result.insertedId,
		email
	});

}

const getMe = async (req, res) => {
	const token = req.header('X-Token');
	const userId = await redisClient.get(`auth_${token}`);

	const user = await dbClient.users.findOne({ _id: ObjectID(userId) });
	if (!user) return res.status(401).json({ error: 'Unauthorized' });

	return res.json({ id: user._id, email: user.email });
}


export default {
	postNew,
}
