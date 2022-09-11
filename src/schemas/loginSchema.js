import joi from "joi";

const loginSchema = joi.object({
	name: joi.string().required().trim(),
});

export default loginSchema;
