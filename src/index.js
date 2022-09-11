import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { MongoClient, ObjectId } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
	db = mongoClient.db("my-wallet");
});

const app = express();
app.use(express.json());
app.use(cors());

const loginSchema = joi.object({
	name: joi.string().required().trim(),
});

const transactionSchema = joi.object({
	amount: joi.number().required(),
	description: joi.string().required().trim(),
	type: joi.string().required().valid("withdraw", "deposit"),
});

app.post("/sign-in", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await db.collection("users").findOne({ email });
		if (user && bcrypt.compareSync(password, user.password)) {
			const token = uuid();
			await db.collection("sessions").insertOne({ userId: user._id, token });
			res.send({ token: token, username: user.name });
		} else {
			return res.status(404).send("Usuário ou senha não encontrada");
		}
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

//validar email
app.post("/sign-up", async (req, res) => {
	const { email, name, password } = req.body;
	const invalidEmail = await db.collection("users").findOne({ email: email });
	const validation = loginSchema.validate({ name });

	if (validation.error) {
		console.log(validation.error.message);
		return res.sendStatus(422);
	}

	if (invalidEmail) {
		return res.sendStatus(409);
	}

	try {
		const passwordHash = bcrypt.hashSync(password, 10);
		await db
			.collection("users")
			.insertOne({ email, name, password: passwordHash });
		res.sendStatus(201);
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

//incluir username
app.get("/transactions", async (req, res) => {
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
});

app.post("/transactions/:type", async (req, res) => {
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
});

app.listen(5000, () => {
	console.log("Listening on port 5000");
});
