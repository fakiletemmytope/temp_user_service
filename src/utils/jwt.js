import jsonwebtoken, { decode } from "jsonwebtoken"
import { configDotenv } from "dotenv"

configDotenv()
const SECRETKEY = process.env.SECRETKEY


export const tokenBlacklist = new Set();


export const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};


export const getToken = async (payload, time = "60m") => {
    const options = {
        expiresIn: time
    }
    try {
        const token = jsonwebtoken.sign(payload, SECRETKEY, options);
        return token
    } catch (err) {
        throw err
    }
}

export const verifyToken = (token) => {
    const res = {}
    try {
        const decoded = jsonwebtoken.verify(token, SECRETKEY);
        res.decoded = decoded
    } catch (err) {
        res.error = err
    } finally {
        return res
    }
}

