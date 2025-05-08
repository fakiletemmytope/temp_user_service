import mongoose from "mongoose"

const { Schema, model } = mongoose

const UserType = {
    COMMUTER: 'commuter',
    DRIVER: 'driver',
    MERCHANT: 'merchant',
    ADMIN: 'admin'
}

const Status = {
    ACTIVATED: 'activated',
    SUSPENDED: 'suspended',
    BANNED: 'banned',
    INACTIVE: 'inactive'

}

const UserSchema = new Schema(
    {
        first_name: { type: String },
        last_name: { type: String },
        email: { type: String, required: true, unique: true },
        phone_number: { type: String, required: true, unique: true },
        password: { type: String },
        usertype: { type: String, enum: Object.values(UserType), required: true },
        status: { type: String, enum: Object.values(Status), required: true, default: Status.INACTIVE }
    },
    {
        timestamps: true
    }
)


export const UserModel = model('USER', UserSchema)


const CodeSchema = new Schema(
    {
        code: { type: String, required: true },
        email: { type: String, required: true },
        phone_number: { type: String, required: true },
    },
    {
        timestamps: true
    }
)

CodeSchema.index({ code: 1, email: 1, phone_number: 1 }, { unique: true })

export const CodeModel = model('Code', CodeSchema)