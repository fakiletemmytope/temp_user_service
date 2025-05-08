import { dbClose, dbConnect } from "./db-connect.js"
import { UserModel } from "../schema/user.js "
import { hash_password } from "../utils/passwd.js"


export const syncDb = async () => {
    try {
        await dbConnect()
        await UserModel.syncIndexes()
        const admin = await UserModel.findOne(
            { usertype: "admin" }
        )
        if (!admin) {
            const user = {
                first_name: "Admin",
                last_name: "Admin",
                usertype: "admin",
                phone_number: "+23412346789",
                email: "admin@example.com",
                status: "activated",
                password: await hash_password("*.Admin1.*")
            }
            await UserModel.create(user)
        }
        console.log("db initiated")
    } catch (error) {
        console.log(error.message)
    }
    finally {
        dbClose()
    }

}