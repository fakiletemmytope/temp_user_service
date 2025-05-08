import { Router } from "express";
import { validate_userCreate, validate_userUpdate } from "../middlewares/validator.js";
import {
    get_user,
    get_users,
    delete_user,
    update_user,
    update_profile,
    create_user
} from "../controller/user-controller.js";
import { authenticate, isAdmin, hashPassword } from "../middlewares/authenticator.js";

const router = Router()

router.get('/', authenticate, isAdmin, get_users)
router.get('/:id', authenticate, get_user)
router.post('/', validate_userCreate, create_user)
router.put('/:id', authenticate, update_user)
router.put('/profile/:id', hashPassword, update_profile)
router.delete('/:id', authenticate, delete_user)


export const user_router = router