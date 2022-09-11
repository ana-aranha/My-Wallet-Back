import express from "express";
import cors from "cors";
import routerAuth from "./routers/authRouter.js";
import routerTransactions from "./routers/transactionsRouter.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(routerAuth);
app.use(routerTransactions);

app.listen(5000, () => {
	console.log("Listening on port 5000");
});
