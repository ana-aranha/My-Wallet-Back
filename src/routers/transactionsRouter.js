import express from "express";
import {
	GetTransactions,
	CreateTransaction,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/transactions", GetTransactions);

router.post("/transactions/:type", CreateTransaction);

export default router;
