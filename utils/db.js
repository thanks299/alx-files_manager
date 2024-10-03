import pkg from 'mongodb';
const { MongoClient, ServerApiVersion } = pkg;

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || "files_manager";

class DBClient {
	constructor() {
		this.url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
		this.createConnection()
			.catch((err) => console.error(err));
	}

	async createConnection() {
		this.client = new MongoClient(this.url, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});

		try {
			await this.client.connect();
			this.db = this.client.db(DB_DATABASE);
			this.users = this.db.collection('users');
			this.files = this.db.collection('files');
			console.log("MongoDB connected successfully");
		} catch (error) {
			console.error("Error connecting to MongoDB:", error);
			throw error; // Propagate error for handling elsewhere
		}
	}

	// Method to check if the MongoDB client is connected
	isAlive() {
		return !!this.client && !!this.client.topology && this.client.topology.isConnected();
	}

	async nbUsers() {
		try {
			const usersCollection = this.db.collection("users");
			return await usersCollection.countDocuments();
		} catch (error) {
			console.error("Error counting users:", error);
			throw error; // Propagate error for handling elsewhere
		}
	}

	async nbUsers() {
		try {
			const usersCollection = this.db.collection("users");
			return await usersCollection.countDocuments();
		} catch (error) {
			console.error("Error counting users:", error);
			throw error; // Propagate error for handling elsewhere
		}
	}

	async nbFiles() {
		try {
			const filesCollection = this.db.collection("files");
			return await filesCollection.countDocuments();
		} catch (error) {
			console.error("Error counting files:", error);
			throw error; // Propagate error for handling elsewhere
		}
	}

	async closeConnection() {
		try {
			await this.client.close();
			console.log("MongoDB connection closed");
		} catch (error) {
			console.error("Error closing MongoDB connection:", error);
			throw error; // Propagate error for handling elsewhere
		}
	}
}

const dbClient = new DBClient();
export default dbClient;
