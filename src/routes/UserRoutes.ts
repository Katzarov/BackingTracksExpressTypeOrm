const express = require("express");
const passport = require("passport");
const router = express.Router();

import User from "../models/user";
import { index, create } from "../controllers/UserController";
//@ts-ignore
// const tracks = require("../controllers/TrackController");

import { isSamePassword } from "../utils/passwordUtils";
import { issueJWT } from "../utils/jwtUtils";
import { NextFunction, Request, Response } from "express";

//@ts-ignore
router.get("/protected", passport.authenticate("jwt", { session: false }), (_req, res, _next) => {
    res.status(200).json({
        success: true,
        msg: "You are successfully authenticated to this route!"
    });
});

router.get("/users", passport.authenticate("jwt", { session: false }), index);

router.post("/login", function (req: Request, res: Response, next: NextFunction) {
    User.findOne({ where: { email: req.body.email } })
        //@ts-ignore
        .then(user => {
            if (!user) {
                return res
                    .status(401)
                    .json({ success: false, msg: "No user registered with email." });
            }

            const isValid = isSamePassword(req.body.password, user.phash, user.salt);

            if (isValid) {
                const tokenObject = issueJWT(user);

                res.status(200).json({
                    success: true,
                    token: tokenObject.token,
                    expiresIn: tokenObject.expires
                });
            } else {
                res.status(401).json({ success: false, msg: "Wrong password." });
            }
        })
        .catch((err: any) => {
            res.status(400).json({ success: false, msg: "Bad request." });
            next(err);
        });
});

// Register a new user
router.post("/register", create);

export default router;
