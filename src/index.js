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

app.post("/sign-in", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await db.collection("users").findOne({ email });
		if (user && bcrypt.compareSync(password, user.password)) {
			const token = uuid.v4();
			await db.collection("sessions").insertOne({ userId: user._id, token });
			res.send(token);
		} else {
			return res.status(404).send("Usuário ou senha não encontrada");
		}
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

app.post("/sign-up", async (req, res) => {
	const { email, name, password } = req.body;

	const validation = loginSchema({ name });

	if (validation.error) {
		console.log(validation.error.message);
		return res.sendStatus(422);
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

app.get("/transactions", (req, res) => {});

app.post("/transactions", (req, res) => {});

app.listen(5000, () => {
	console.log("Listening on port 5000");
});
