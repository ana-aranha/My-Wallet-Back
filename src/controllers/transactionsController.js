import { ObjectId } from "mongodb";
import db from "../database/db.js";
import transactionSchema from "../schemas/TransactionSchema.js";
import dayjs from "dayjs";

export async function GetTransactions(req, res) {
	const session = res.locals.session;

	try {
		const transactions = await db.collection("transactions").find().toArray();
		const filteredTransactions = transactions.filter((el) => {
			return (
				ObjectId(el.userId).toString() === ObjectId(session.userId).toString()
			);
		});
		res.send(filteredTransactions.reverse());
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
}

export async function CreateTransaction(req, res) {
	const { amount, description } = req.body;
	const { type } = req.params;
	const session = res.locals.session;

	try {
		const validation = transactionSchema.validate({
			amount,
			description,
			type,
		});

		if (validation.error) {
			console.log(validation.error.message);
			return res.sendStatus(422);
		}
		await db.collection("transactions").insertOne({
			amount,
			description,
			type,
			userId: session.userId,
			date: dayjs().format("DD/MM"),
		});
		res.sendStatus(201);
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
}
