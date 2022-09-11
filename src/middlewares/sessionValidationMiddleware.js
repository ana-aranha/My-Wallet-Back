import db from "../database/db.js";

export async function validateSession(req, res, next) {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");

	const session = await db.collection("sessions").findOne({ token: token });
	if (!session) {
		return res.sendStatus(401);
	}

	res.locals.session = session;
	next();
}
