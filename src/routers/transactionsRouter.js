import express from "express";
import {
	GetTransactions,
	CreateTransaction,
	DeleteTransactions,
} from "../controllers/transactionsController.js";
import { validateSession } from "../middlewares/sessionValidationMiddleware.js";

const router = express.Router();

router.use(validateSession);

router.get("/transactions", GetTransactions);

router.post("/transactions/:type", CreateTransaction);

router.delete("transactions/ID_TRANSACTION", DeleteTransactions);

export default router;
