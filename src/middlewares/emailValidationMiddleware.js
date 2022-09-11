import db from "../database/db.js";

export async function emailExists(req, res, next) {
	const { email } = req.body;
	const user = await db.collection("users").findOne({ email: email });

	res.locals.user = user;
	next();
}
