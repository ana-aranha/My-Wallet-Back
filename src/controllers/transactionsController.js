import { ObjectId } from "mongodb";
import db from "../database/db.js";
import transactionSchema from "../schemas/TransactionSchema.js";
import dayjs from "dayjs";

export async function GetTransactions(req, res) {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");

	try {
		const session = await db.collection("sessions").findOne({ token: token });
		if (!session) {
			return res.sendStatus(401);
		}

		const transactions = await db.collection("transactions").find().toArray();
		console.log(transactions, ObjectId(session.userId).toString());
		const filteredTransactions = transactions.filter((el) => {
			return (
				ObjectId(el.userId).toString() === ObjectId(session.userId).toString()
			);
		});
		console.log(filteredTransactions);
		res.send(filteredTransactions);
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
}

export async function CreateTransaction(req, res) {
	const { authorization } = req.headers;
	const { amount, description } = req.body;
	const { type } = req.params;
	const token = authorization?.replace("Bearer ", "");

	console.log(type, authorization, amount, description);

	console.log(token);
	try {
		const session = await db.collection("sessions").findOne({ token: token });
		if (!session) {
			return res.sendStatus(401);
		}
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
