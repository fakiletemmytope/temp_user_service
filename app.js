import express from "express"
import config from "./config.js"
import { user_router } from "./src/route/user-router.js"
import bodyParser from "body-parser"
import { syncDb } from "./src/database/db_init.js"
import { auth_router } from "./src/route/auth-router.js"
import cors from 'cors'
const app = express()

const port = config.port || 3000

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

//routes
app.use("/auth", auth_router)
app.use("/api/users", user_router)

app.listen(
    port,
    async () => {
        await syncDb()
        console.log(`User service listening on port ${port} `)
    }
)