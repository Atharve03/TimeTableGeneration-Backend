import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
console.log("Auth routes loaded");
        // <-- LOGIN ROUTE
router.post("/register", registerUser);
console.log("Auth routes loaded");


export default router;
