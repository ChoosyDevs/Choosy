const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Upload = require("./upload");

const userSchema = new mongoose.Schema(
    {
        // Username
        name: {
            type: String,
            trim: true,
        },
        // User email
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        // User password
        password: {
            type: String,
            required: false,
            trim: true,
        },
        // Refresh tokens
        refreshTokens: [
            {
                refreshToken: {
                    type: String,
                    required: true,
                },
            },
        ],
        // Authentication tokens
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        // Number of votes this user has given
        level: {
            type: Number,
            default: 0,
        },
        // Number of polls this user has made
        publications: {
            type: Number,
            default: 0,
        },
        // Array of users that have been marked by "Hide this user" or "Report"
        hatedUsers: [
            {
                usersId: {
                    type: String,
                },
            },
        ],
        // User profile picture URL
        Thumbnail: {
            type: String,
            default: "",
        },
        // User birthday
        birthday: {
            type: Date,
        },
        // 6-digit password hash
        resetPasswordToken: {
            type: String,
            required: false,
        },
        // 6-digit password expiration date
        resetPasswordExpires: {
            type: Date,
        },
        // Wether the user is shadow banned
        shadowBanUser: {
            type: Boolean,
            default: false,
        },
        // Wether the user is banned
        banned: {
            type: Boolean,
            default: false,
        },
        // Number of uploads by this user that have been banned
        numberOfBanned: {
            type: Number,
            default: 0,
        },
        // Age range of the user that are allowed to see this user's polls
        targetAgeGroups: {
            type: [Number],
            default: [13, 10000],
        },
        // Array of uploads this user has voted on
        votedUploads: [
            {
                uploadId: {
                    type: String,
                },
                votedPhoto: {
                    type: Number,
                },
                expiredDate: {
                    type: Date,
                },
            },
        ],
        // Wether this user is verified
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.virtual("uploads", {
    ref: "Upload",
    localField: "_id",
    foreignField: "owner",
});

// remove certain not useful or sensitive sets of data when parsing as json
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    userObject.passwordPresent = userObject.password !== "";

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.refreshTokens;
    delete userObject.hatedUsers;
    delete userObject.numberOfBanned;
    delete userObject.banned;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;

    return userObject;
};

// Generate new authentication token
userSchema.methods.generateAuthToken = async function () {
    const user = this;

    // Generate token
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
    );

    let newTokenArrayFirst;

    // Add token to tokens array of the user
    user.tokens = user.tokens.concat({ token });

    // Cleanup the expired tokens
    newTokenArrayFirst = user.tokens.map((token) => {
        try {
            const decoded = jwt.verify(token.token, process.env.JWT_SECRET);
            return token;
        } catch (e) {}
    });

    const newTokenArray = newTokenArrayFirst.filter(
        (item) => item !== undefined
    );

    user.tokens = newTokenArray;
    await user.save();

    return token;
};

// Generate refresh token
userSchema.methods.generateRefreshToken = async function () {
    const user = this;
    // Generate new token
    const refreshToken = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET_REFRESH
    );

    // Add token to refreshTokens list
    user.refreshTokens = user.refreshTokens.concat({ refreshToken });

    await user.save();

    return refreshToken;
};

// Find user given an email and password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid Email");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid Password");
    }

    return user;
};

// When saving a user, hash the password
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        if (user.password !== "") {
            user.password = await bcrypt.hash(user.password, 8);
        }
    }

    next();
});

// Delete user uploads when deleting an account
userSchema.pre("remove", async function (next) {
    const user = this;
    await Upload.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
