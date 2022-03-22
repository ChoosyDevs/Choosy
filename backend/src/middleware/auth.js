const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Authentication middleware for every request
const auth = async (req, res, next) => {
    try {
        // Decrypt token, verify it and search for user
        const token = req.header("Authorization").split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token,
        });

        if (!user) {
            throw new Error();
        }

        // Add token and user to the request
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(411).send({ error: "Please authenticate." });
    }
};

module.exports = auth;
