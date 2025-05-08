import Joi from "joi";

const login_validator = Joi.object(
    {
        email: Joi.string(),
        password: Joi.string().required(),
        phone_number: Joi.string()
    }

).min(2)


const create_validator = Joi.object(
    {

        email: Joi.string().required(),
        phone_number: Joi.string().required(),
        usertype: Joi.string().valid("merchant", "driver", "commuter").required(),
    }
)


const profile_validator = Joi.object(
    {
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        password: Joi.string().required()
    }
).min(3)

const update_validator = Joi.object(
    {
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
    }
).min(1)

export {
    profile_validator,
    create_validator,
    login_validator,
    update_validator
}