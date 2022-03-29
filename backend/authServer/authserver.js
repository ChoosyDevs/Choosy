// Imports for the process to work
const port = process.env.AUTH_PORT;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const User = require("../src/models/user");
require("../src/db/mongoose");
const nodemailer = require("nodemailer");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

app.use(compression());
app.use(express.json());
app.use(helmet());

// Handles the register action
app.post("/auth/users/register", async (req, res) => {
    const email = req.body.email;
    const userEmail = await User.findOne({ email });

    // Check if there is an account with this email
    if (!userEmail) {
        const name = req.body.name;
        const userUsername = await User.findOne({ name });

        // Check if there is an account with this username
        if (!userUsername) {
            // Create user from the provided info
            const user = new User(req.body);
            try {
                // Add user to database
                await user.save();

                // Create tokens for the user
                const token = await user.generateAuthToken();
                const refreshToken = await user.generateRefreshToken();

                // Return the user and the tokens
                res.status(201).send({ user, token, refreshToken });
            } catch (e) {
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(402);
    }
});

// Handle login action
app.post("/auth/users/login", async (req, res) => {
    try {
        // Find a user with the given credentials
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );

        // If the user is banned, return status 413
        if (user.banned === true) {
            res.sendStatus(413);
        } else {
            // Create tokens and return them
            const token = await user.generateAuthToken();
            const refreshToken = await user.generateRefreshToken();
            res.status(200).send({ user, token, refreshToken });
        }
    } catch (e) {
        res.sendStatus(400);
    }
});

// Handle the token creation
app.post("/auth/token", async (req, res) => {
    try {
        const refreshToken = req.header("Authorization").split(" ")[1];
        // Decode provided refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET_REFRESH
        );
        // Find the user with the id decoded from the token
        const user = await User.findOne({
            _id: decoded._id,
            "refreshTokens.refreshToken": refreshToken,
        });

        // If the user does not exist
        if (!user) {
            throw new Error();
        } else if (user.banned === false) {
            // If the user exists and has not been banned, generate new short term token
            const token = await user.generateAuthToken();
            res.status(201).send({ user, token, refreshToken });
        } else {
            res.sendStatus(412);
        }
    } catch (e) {
        res.status(400).send("Auth server token error");
    }
});

// Handle log out action
app.post("/auth/users/logout", async (req, res) => {
    try {
        const refreshToken = req.header("Authorization").split(" ")[1];

        // Decode refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET_REFRESH
        );

        // Find user from id decoded from refresh token
        const user = await User.findOne({
            _id: decoded._id,
            "refreshTokens.refreshToken": refreshToken,
        });

        if (!user) {
            throw new Error();
        }

        // Remove the refresh token from the refreshToken list of the user
        // (user is logged out of that device)
        user.refreshTokens = user.refreshTokens.filter((token) => {
            return token.refreshToken !== refreshToken;
        });

        await user.save();
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(400);
    }
});

// Delete user
app.delete("/auth/users/me", async (req, res) => {
    try {
        const refreshToken = req.header("Authorization").split(" ")[1];
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET_REFRESH
        );

        // Find user from id decoded from refresh token
        const user = await User.findOne({
            _id: decoded._id,
            "refreshTokens.refreshToken": refreshToken,
        });
        if (!user) {
            throw new Error();
        }

        // Delete user from users db
        await user.remove();
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(400);
    }
});

//
app.post("/auth/users/forgotPassword", async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
        res.sendStatus(404);
    } else {
        if (user.banned === false) {
            // Prepare email with 6-digit password
            let transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "choosyhelpteam@gmail.com",
                    pass: "##########################",
                },
                secure: false,
                logger: true,
            });

            // Create random 6-digit password
            let verification = Math.floor(100000 + Math.random() * 900000);

            // Create message
            let message = {
                from: "choosyhelpteam@gmail.com",
                to: user.email,
                subject: "Password reset",
                text:
                    "Paste this 6-digit number to the app to reset your password. " +
                    verification,
            };

            // Send email
            transport.sendMail(message, function (err, info) {
                if (err) {
                    console.log("mail error", err);
                }
            });

            // Hash 6-digit password
            let resetPasswordTokenHash = await bcrypt.hash(
                verification.toString(),
                8
            );

            // Save 6-digit password and expiration date
            user.resetPasswordToken = resetPasswordTokenHash;
            user.resetPasswordExpires = Date.now() + 300000;
            await user.save();
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    }
});

// Handle reset password
app.post("/auth/users/resetPassword", async (req, res) => {
    const email = req.body.email;
    const resetPassword = req.body.resetPassword;

    // Find a user with the provided email
    const user = await User.findOne({ email });
    if (user.resetPasswordExpires < Date.now()) {
        res.sendStatus(410);
    } else {
        // Return status 200 if 6-digit password is correct
        const isMatch = await bcrypt.compare(
            resetPassword,
            user.resetPasswordToken
        );
        if (!isMatch) {
            res.sendStatus(420);
        } else {
            res.sendStatus(200);
        }
    }
});

app.listen(port, () => {
    console.log("Server is up on port " + port);
});
