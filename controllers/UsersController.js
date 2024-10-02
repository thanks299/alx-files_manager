import dbClient from "../utils/db.js";
import sha1 from "sha1";


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

	const user = result.ops[0];
	user.password = undefined;
	res.status(201).json({
		user
	});

}


export default {
	postNew,
}
