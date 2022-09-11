import loginSchema from "../schemas/loginSchema.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import db from "../database/db.js";

export async function signUp(req, res) {
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
}

export async function signIn(req, res) {
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
}
