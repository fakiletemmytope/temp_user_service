import { dbConnect, dbClose } from "../database/db-connect.js"
import { CodeModel, UserModel } from "../schema/user.js"
import { reg_msg } from "../utils/email.js"
import { hash_password } from "../utils/passwd.js"
import { generateCode } from "../utils/code_generator.js"
import { getToken } from "../utils/jwt.js"

const get_user = async (req, res) => {
    if (req.decode.usertype === "admin" || req.decode._id === req.params.id) {
        try {
            await dbConnect()
            const user = await UserModel.findById(req.params.id, 'first_name last_name phone_number email usertype profile')
            user ? res.status(200).json(user) : res.status(404).send("user not found")
        } catch (error) {
            console.log("error@get_user", error.message)
            res.status(500).send("internal server error")
        }
        finally {
            await dbClose()
        }
    }
    else res.status(403).send("Unauthorised user")

}

const get_users = async (req, res) => {

    try {
        await dbConnect()
        const users = await UserModel.find({}, 'first_name last_name address email usertype')
        res.status(200).json(users)
    } catch (error) {
        console.log("error@get_user", error.message)
        res.status(500).send("internal server error")
    }
    finally {
        await dbClose()
    }
}


const update_user = async (req, res) => {
    const { first_name, last_name } = req.body

    const update = {}
    if (first_name) update.first_name = first_name
    if (last_name) update.last_name = last_name

    try {
        await dbConnect()
        const user = await UserModel.findByIdAndUpdate(req.decode._id, update, { new: true })
        user ? res.status(200).send("User details updated") : res.status(400).send("User update failed")
    } catch (error) {
        console.log("error@create_user", error.message)
        res.status(500).send("internal server error")
    } finally {
        await dbClose()
    }
}

const update_profile = async (req, res) => {
    const { first_name, last_name, password } = req.body
    const update = {}
    update.first_name = first_name
    update.last_name = last_name
    update.password = password

    try {
        await dbConnect()
        const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true })
        user ? res.status(200).send("User details updated") : res.status(400).send("User update failed")
    } catch (error) {
        console.log("error@create_user", error.message)
        res.status(500).send("internal server error")
    } finally {
        await dbClose()
    }
}

const delete_user = (req, res) => {

}

const create_user = async (req, res) => {
    const { usertype, phone_number, email } = req.body
    const user_info = { usertype, phone_number, email }
    try {
        await dbConnect()
        const code = generateCode(4)
        const user = await UserModel.create(user_info)
        const encode = await getToken({ code, email, phone_number, _id: user._id }, "20m")
        await CodeModel.create({ code: encode, email, phone_number })
        await reg_msg(email, code)

        //create function that will also send code to the phone_number
        res.status(201).json(user)
    } catch (error) {
        if (error.code === 11000) return res.status(400).send("Email or phone number already used")
        console.log("error@create_user", error.message)
        res.status(500).send("internal server error")
    } finally {
        await dbClose()
    }
}

export {
    get_user,
    get_users,
    update_user,
    update_profile,
    delete_user,
    create_user
}