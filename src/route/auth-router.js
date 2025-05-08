import { Router } from "express";
import { activate_user, get_activation_token, login, logout, change_pw, request_pw_change } from "../controller/auth-controller.js";
import { hashPassword, unrestricted } from "../middlewares/authenticator.js";

const router = Router()

router.post("/login", login)
router.get("/logout", logout)

router.post("/activate", activate_user)
router.post("/get-activation-token", get_activation_token)

router.post("/change-password", hashPassword, unrestricted, change_pw)
router.post("/forget-password", request_pw_change)


export const auth_router = router