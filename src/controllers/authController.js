import loginSchema from "../schemas/loginSchema.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import db from "../database/db.js";

export async function signUp(req, res) {
	const { email, name, password } = req.body;
	const validation = loginSchema.validate({ name });
	const user = res.locals.user;

	if (validation.error) {
		console.log(validation.error.message);
		return res.sendStatus(422);
	}

	if (user) {
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
	const { password } = req.body;
	const user = res.locals.user;
	try {
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
