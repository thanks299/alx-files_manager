import express from "express";
import AppController from "../controller/AppController.js";
import UsersController from "../controller/UsersController.js";

const router = express.Router();



router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats)


router.post("/users", UsersController.postNew);


export default router;
