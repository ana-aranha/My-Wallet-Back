import joi from "joi";

const transactionSchema = joi.object({
	amount: joi.number().required(),
	description: joi.string().required().trim(),
	type: joi.string().required().valid("withdraw", "deposit"),
});

export default transactionSchema;
