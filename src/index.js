import express from "express";
import cors from "cors";
import routerAuth from "./routers/authRouter.js";
import routerTransactions from "./routers/transactionsRouter.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(routerAuth);
app.use(routerTransactions);

app.listen(process.env.PORT, () => {
	console.log("Listening on port" + process.env.PORT);
});
