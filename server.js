import express from "express";
import indexRouter from "./routes/index.js";

const server = express();


const PORT = process.env.PORT || 5000;
server.use(express.json());

server.use("/", indexRouter);

server.listen(PORT, () => {
	console.log("Server is running on port 5000");
});
