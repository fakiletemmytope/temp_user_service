import { CodeModel, UserModel } from "../schema/user.js";
import { verify_password } from "../utils/passwd.js";
import { generateCode } from "../utils/code_generator.js";
import { getToken, tokenBlacklist, verifyToken } from "../utils/jwt.js"
import { dbClose, dbConnect } from "../database/db-connect.js";
import { activation_token_req_msg, pw_change_msg } from "../utils/email.js"
import config from "../../config.js";
import { Query } from "mongoose";
import { decode } from "jsonwebtoken";

const URL = config.base_url

export const login = async (req, res) => {
    const { email, password, phone_number } = req.body
    try {
        await dbConnect()
        const user = await UserModel.findOne({
            $or: [
                { email: email },
                { phone_number: phone_number }
            ],
            status: 'activated'
        }).exec()
        if (!user || await verify_password(user.password, password) == false) {
            res.status(404).send("User not found or Incorrect login details")
        }
        else if (user.status === "inactive" || user.status === "suspended") {
            res.status(404).send(`User is ${user.status} and cannot be logged in. Contact the admin if suspended or request for activation token`)
        }
        else {
            const { _id, first_name, last_name, email, usertype } = user
            const token = await getToken({ first_name, last_name, _id, usertype, email })
            res.status(200).json({ _id, first_name, last_name, email, token, usertype })
        }

    } catch (err) {
        console.log("error occured@login", err.message)
        res.status(500).send("Internal Server Error")
    } finally {
        dbClose();
    }
}


export const logout = (req, res) => {
    const auth = req.headers.authorization
    if (auth != undefined) {
        const token = auth.split(" ")[1];
        tokenBlacklist.add(token);
        res.status(200).json({ message: "Logged out successfully!" });
    }
    else res.status(400).json("unauthenticated user")

};


export const activate_user = async (req, res) => {
    const { code, email, phone_number } = req.body
    if (code) {
        try {
            await dbConnect()
            const token = await CodeModel.findOne(
                {
                    $or: [
                        { email: email },
                        { phone_number: phone_number }
                    ]

                }
            )

            if (token) {
                const { decoded } = verifyToken(token.code)
                if (decoded) {
                    const update_user = await UserModel.findOneAndUpdate(
                        { _id: decoded._id, email: decoded.email }, { status: "activated" }, { new: true }
                    )
                    const { _id, first_name, last_name, status, usertype, createdAt, updatedAt } = update_user
                    update_user ? res.status(200).json({ _id, first_name, last_name, status, usertype, createdAt, updatedAt, email: update_user.email }) : res.status(403).send("User not activated")
                }
                else res.status(400).send("Code not found or expired")
            }
            else {
                res.status(404).send("invalid activation code")
            }

        } catch (err) {
            console.log(err)
            console.log("error occured@active_user:", err.message)
            res.status(500).send("internal server error")
        }
        finally {
            dbClose()
        }
    } else {
        res.status(403).send("token required, generate a token")
    }
}

export const get_activation_token = async (req, res) => {
    const { email, phone_number } = req.body
    if (email) {
        try {
            await dbConnect()
            const user = await UserModel.findOne({ email: email, status: "inactive" })
            if (user) {
                if (user.status === "inactive") {
                    const { _id, email, phone_number } = user
                    const code = generateCode(4)
                    const encode = await getToken({ _id, code, email, phone_number }, "20m")
                    await CodeModel.findOneAndUpdate(
                        {
                            $or: [
                                { email: email },
                                { phone_number: phone_number }
                            ]
                        },
                        { code: encode }
                    )
                    await activation_token_req_msg(email, code)
                    res.status(200).send(`Activation link has been sent to your email`)
                }
                else {
                    res.status(200).send(`User is ${user.status}`)
                }
            }
            else {
                res.status(404).send("User not found or the user is already activated or suspended")
            }
        } catch (error) {
            console.log("error occured@get-activation-token:", error.message)
            res.status(500).send("internal server error")
        } finally {
            dbClose()
        }
    }
}


export const request_pw_change = async (req, res) => {
    const { email } = req.body
    if (email) {
        try {
            await dbConnect()
            const user = await UserModel.findOne({ email: email, status: "activated" })
            if (user) {
                const { _id, email, first_name } = user
                const code = generateCode(4)
                const encode = await getToken({ _id, code, email }, "20m")
                await CodeModel.findOneAndUpdate(
                    {
                        $or: [
                            { email: email }
                        ]
                    },
                    { code: encode }
                )
                await pw_change_msg(email, first_name, code)
                res.status(200).send(`Password Change token has been sent to your email`)
            }
            else {
                res.status(404).send("User not found")
            }
        } catch (error) {
            console.log("error occured@request_pw_change", error.message)
            res.status(500).send("internal server error")
        } finally {
            dbClose()
        }
    }
}

export const change_pw = async (req, res) => {
    const { password, code, email } = req.body
    try {
        await dbConnect()
        if (req.decode) {
            const user = await UserModel.findByIdAndUpdate(req.decode._id, { password: password })
            user ? res.status(200).send('password change successful') : res.status(400).send('password change failed')
        }
        else {

            const token = await CodeModel.findOne(
                {
                    email: email
                },
            )
            if (token) {
                const { decoded, error } = verifyToken(token.code)
                if (decoded && (decoded.code === code) && (decoded.email === email)) {
                    const user = await UserModel.findOneAndUpdate(
                        { _id: decoded._id, email: decoded.email }, { password: password }, { new: true }
                    )
                    user ? res.status(200).send('password change successful') : res.status(400).send('password change failed')
                }
                else {
                    res.status(400).send("Invalid token or token expired")
                }
            }
            else {
                res.status(400).send('Code not found')
            }
        }
    } catch (error) {
        console.log("error occured@change_pw", error.message)
        res.status(500).send("internal server error")
    } finally {
        await dbClose()
    }
}