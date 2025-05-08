import {
    login_validator,
    create_validator,
    update_validator,
    profile_validator,
} from "../validation/input_validation.js"

export const validate_userCreate = async (req, res, next) => {
    const { error } = create_validator.validate(req.body, { abortEarly: false })
    error ? res.status(422).json(error.details) : next()
}

export const validate_userUpdate = async (req, res, next) => {
    const { error } = update_validator.validate(req.body, { abortEarly: false })
    error ? res.status(422).json(error.details) : next()
}

export const validate_profile = async (req, res, next) => {
    const { error } = profile_validator.validate(req.body, { abortEarly: false })
    error ? res.status(422).json(error.details) : next()
}


export const validate_auth_input = async (req, res, next) => {
    const { error } = login_validator.validate(req.body, { abortEarly: false })
    error ? res.status(422).json(error.details) : next()
}

