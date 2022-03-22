const mongoose = require("mongoose");

// Schema for "uploads" collection
const uploadSchema = new mongoose.Schema(
    {
        // Total votes of poll
        totalvotes: {
            type: Number,
            default: 0,
        },
        // Array with userIDs of the people that have seen the poll
        visited: [
            {
                usersId: {
                    type: String,
                },
            },
        ],
        // Array with userIDs of the people that have skipped the poll
        skipped: [
            {
                usersId: {
                    type: String,
                },
            },
        ],
        // Array of photo objects
        photos: [
            {
                // URL to google cloud
                uri: {
                    type: String,
                },
                // Number of votes on this photo
                votes: {
                    type: Number,
                    default: 0,
                },
                // Width photo (useful for aspectRatio)
                width: {
                    type: Number,
                },
                // Height photo (useful for aspectRatio)
                height: {
                    type: Number,
                },
            },
        ],
        // Age range of people that can see the poll
        targetAgeGroups: {
            type: [Number],
            default: [13, 10000],
        },
        // Name of the user that made the upload
        ownerName: {
            type: String,
            required: true,
        },
        // Birthday of the user that made the upload
        ownerBirthday: {
            type: Date,
        },
        // Profile pic URL of the user that made the upload
        ownerThumbnail: {
            type: String,
            default: "",
        },
        // True if the upload is active
        active: {
            type: Boolean,
            required: true,
            default: true,
        },
        // userID of the user that made the upload
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        // Timestamp of the moment the poll was created
        date: {
            type: Date,
            default: Date.now,
        },
        // Timestamp of the moment the poll becomes inactive
        finalDate: {
            type: Date,
        },
        // Array of social media this poll is targeted for
        targetSocialMedia: {
            type: [String],
            default: [],
        },
        // Array of userID od users that reported the upload
        reported: [
            {
                usersId: {
                    type: String,
                },
            },
        ],
        // Number of reports
        numberOfReported: {
            type: Number,
            default: 0,
        },
        // Wether the upload should be shadow banned
        shadowBanUpload: {
            type: Boolean,
            default: false,
        },
        // Wether the owner is verified
        ownerVerified: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

// remove certain not useful sets of data when parsing as json
uploadSchema.methods.toJSON = function () {
    const upload = this;
    const uploadObject = upload.toObject();

    delete uploadObject.visited;
    delete uploadObject.reported;
    delete uploadObject.skipped;
    delete uploadObject.numberOfReported;

    return uploadObject;
};

const Upload = mongoose.model("Upload", uploadSchema);

module.exports = Upload;
