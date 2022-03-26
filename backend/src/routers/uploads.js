const express = require("express");
const Upload = require("../models/upload");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const uploadImage = require("../helpers/helper.js");
const router = new express.Router();
let sizeOf = require("image-size");

let storage = multer.memoryStorage();

// Prepare multer for file upload
const upload = multer({
    storage: storage,
    // Set the limits of file size
    limits: {
        fileSize: 100000000,
    },
    fileFilter(req, file, cb) {
        // Valid types of images
        if (!file.originalname.match(/\.(jpg|jpeg|png|JPG)$/)) {
            // If the file is not an image returns error
            return cb(new Error("Please upload an image"));
        }
        cb(undefined, true);
    },
});

// Upload poll using multer, with user authentication and maximum number of photos as a middleware
router.post("/uploads", auth, upload.array("photos", 6), async (req, res) => {
    let photos = await Promise.all(
        // For every photo initialise fields
        req.files.map(async (file) => {
            let data;
            try {
                let dimensions = sizeOf(file.buffer);
                const imageUrl = await uploadImage(file);
                if (
                    // If something goes wrong with either the upload in Google Cloud or the photos passed from the front-end, returns error
                    imageUrl === null ||
                    dimensions.width === 0 ||
                    dimensions.height === 0
                ) {
                    throw new Error();
                } else {
                    // Here is the creation of photos property in upload object 
                    data = {
                        uri: imageUrl,
                        votes: 0,
                        width: dimensions.width,
                        height: dimensions.height,
                    };
                }
            } catch (e) {
                res.sendStatus(402);
            }
            return data;
        })
    );

    // Create new upload object
    const upload = new Upload({
        photos: photos,
        finalDate: req.body.finalDate,
        targetAgeGroups: req.body.targetAgeGroups,
        targetSocialMedia: req.body.targetSocialMedia,
        owner: req.user._id,
        ownerName: req.user.name,
        ownerBirthday: req.user.birthday,
        ownerThumbnail: req.user.Thumbnail,
        ownerInstagramName: req.user.instagramName,
        ownerVerified: req.user.verified,
        shadowBanUpload: req.user.shadowBanUser,
    });

    try {
        await upload.save();
        if (req.body.homeEmptyScreen === "false") {
            req.user.publications++;
        }
        await req.user.save();
        res.status(201).send({ uploadId: upload._id });
    } catch (e) {
        console.log("Upload 500 error is : ", e);
        res.sendStatus(500);
    }
});

// Upload profile picture with user authentication and single photo as a middleware
router.post(
    "/uploads/profileAvatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const { file } = req;
        let data;

        try {
          // Upload using multer
            const imageUrl = await uploadImage(file);
            // Here is a check if something goes wrong with the imageUrl
            if (imageUrl === null) {
                throw new Error();
            } else {
                data = { Thumbnail: imageUrl };
            }
        } catch (error) {
            res.sendStatus(402);
        }
        try {
            // This try block ensures that the new profile photo will be updated in all the actions user has done in the past
            req.user.Thumbnail = data.Thumbnail;
            let conditions = { owner: req.user._id };
            let update = {
                $set: {
                    ownerThumbnail: data.Thumbnail,
                },
            };
            let options = { multi: true };
            Upload.updateMany(conditions, update, options, (err, doc) => {
                if (err) throw new Error();
            });
            await req.user.save();
            res.sendStatus(201);
        } catch (e) {
            res.sendStatus(500);
        }
    }
);

// Returns all the uploads of the user, sorted by date if goes through the user authentication middleware
router.get("/uploads/me", auth, async (req, res) => {
    try {
        await req.user
            .populate({ path: "uploads", options: { sort: { date: -1 } } })
            .execPopulate();
        res.send(req.user.uploads);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Return a number of uploads that the user has not seen (also, if there is a link present, add the requested upload)
router.get("/uploads/all", auth, async (req, res) => {
  // If there is a specific uploadID that should be included
    if (req.query.uploadId) {
        try {
            if (req.query.uploadId.startsWith("https://")) {
                throw new Error("promoteLink");
            }

            // Find the upload
            const upload = await Upload.findOne({
                _id: { $eq: req.query.uploadId },
                owner: { $ne: req.user.id },
                active: { $eq: true },
                $or: [
                    { visited: { $not: { $elemMatch: { _id: req.user.id } } } },
                    { skipped: { $elemMatch: { _id: req.user.id } } },
                ],
            });
            // If upload was not found
            if (!upload) {
              // Check if the upload is the user's that requested it
                const uploadCheckOwned = await Upload.findOne({
                    _id: { $eq: req.query.uploadId },
                    owner: { $eq: req.user.id },
                });
                if (uploadCheckOwned) throw new Error("Owned");
                else {
                  // Check if the upload has already been seen by the user
                    const uploadCheckVisited = await Upload.findOne({
                        _id: { $eq: req.query.uploadId },
                        visited: { $elemMatch: { _id: req.user.id } },
                    });
                    if (uploadCheckVisited) throw new Error("AlreadyVisited");
                    else throw new Error("Inactive");
                }
            }
            res.status(200).send(upload);
        } catch (e) {
            try {
              // Find the next X uploads that the user has not interacted with
                const birthday = new Date(req.user.birthday);
                const dateNow = new Date(Date.now());
                const yearsOld = dateNow.getFullYear() - birthday.getFullYear();

                const uploads = await Upload.find({
                    owner: { $nin: req.user.hatedUsers, $ne: req.user.id },
                    shadowBanUpload: { $eq: false },
                    active: { $eq: true },
                    visited: { $not: { $elemMatch: { _id: req.user.id } } },
                    reported: { $not: { $elemMatch: { _id: req.user.id } } },
                    $and: [
                        { "targetAgeGroups.0": { $lte: yearsOld } },
                        { "targetAgeGroups.1": { $gte: yearsOld } },
                    ],
                })
                    .sort({ totalvotes: 1 })
                    .limit(parseInt(req.query.limit));

                if (uploads.length == 0) {
                     // Find the uploads that user has already skipped them
                    const uploadsSkipped = await Upload.find({
                        owner: { $nin: req.user.hatedUsers, $ne: req.user.id },
                        shadowBanUpload: { $eq: false },
                        active: { $eq: true },
                        skipped: { $elemMatch: { _id: req.user.id } },
                        reported: {
                            $not: { $elemMatch: { _id: req.user.id } },
                        },
                        $and: [
                            { "targetAgeGroups.0": { $lte: yearsOld } },
                            { "targetAgeGroups.1": { $gte: yearsOld } },
                        ],
                    })
                        .sort({ totalvotes: 1 })
                        .limit(50);

                    if (uploadsSkipped.length == 0) {
                        // Error handling
                        if (e == "Error: promoteLink")
                            res.status(201).send(uploadsSkipped);
                        else {
                            if (e == "Error: Owned")
                                res.status(201)
                                    .set("linkError", "owned")
                                    .send(uploadsSkipped);
                            else if (e == "Error: AlreadyVisited")
                                res.status(201)
                                    .set("linkError", "alreadyVisited")
                                    .send(uploadsSkipped);
                            else
                                res.status(201)
                                    .set("linkError", "unavailable")
                                    .send(uploadsSkipped);
                        }
                    } else {
                        if (e == "Error: promoteLink")
                            res.status(201).send(uploadsSkipped);
                        else {
                            if (e == "Error: Owned")
                                res.status(201)
                                    .set({
                                        linkError: "owned",
                                        skippedUploads: "true",
                                    })
                                    .send(uploadsSkipped);
                            else if (e == "Error: AlreadyVisited")
                                res.status(201)
                                    .set({
                                        linkError: "alreadyVisited",
                                        skippedUploads: "true",
                                    })
                                    .send(uploadsSkipped);
                            else
                                res.status(201)
                                    .set({
                                        linkError: "unavailable",
                                        skippedUploads: "true",
                                    })
                                    .send(uploadsSkipped);
                        }
                    }
                    res.status(201)
                        .set("skippedUploads", "true")
                        .send(uploadsSkipped);
                } else {
                    if (e == "Error: promoteLink")
                        res.status(201).send(uploads);
                    else {
                        if (e == "Error: Owned")
                            res.status(201)
                                .set("linkError", "owned")
                                .send(uploads);
                        else if (e == "Error: AlreadyVisited")
                            res.status(201)
                                .set("linkError", "alreadyVisited")
                                .send(uploads);
                        else
                            res.status(201)
                                .set("linkError", "unavailable")
                                .send(uploads);
                    }
                }
            } catch (e) {
                res.status(400).send(e);
            }
        }
    } else {
        // Find the next X uploads that the user has not interacted with
        try {
            const birthday = new Date(req.user.birthday);
            const dateNow = new Date(Date.now());
            const yearsOld = dateNow.getFullYear() - birthday.getFullYear();

            const uploads = await Upload.find({
                owner: { $nin: req.user.hatedUsers, $ne: req.user.id },
                shadowBanUpload: { $eq: false },
                active: { $eq: true },
                visited: { $not: { $elemMatch: { _id: req.user.id } } },
                reported: { $not: { $elemMatch: { _id: req.user.id } } },
                $and: [
                    { "targetAgeGroups.0": { $lte: yearsOld } },
                    { "targetAgeGroups.1": { $gte: yearsOld } },
                ],
            })
                .sort({ totalvotes: 1 })
                .limit(parseInt(req.query.limit));

            //show skipped array when there are no other polls to see
            if (uploads.length == 0) {
                const uploadsSkipped = await Upload.find({
                    owner: { $nin: req.user.hatedUsers, $ne: req.user.id },
                    shadowBanUpload: { $eq: false },
                    active: { $eq: true },
                    skipped: { $elemMatch: { _id: req.user.id } },
                    reported: { $not: { $elemMatch: { _id: req.user.id } } },
                    $and: [
                        { "targetAgeGroups.0": { $lte: yearsOld } },
                        { "targetAgeGroups.1": { $gte: yearsOld } },
                    ],
                })
                    .sort({ totalvotes: 1 })
                    .limit(50);
                if (uploadsSkipped.length == 0)
                    res.status(201).send(uploadsSkipped);
                else
                    res.status(201)
                        .set("skippedUploads", "true")
                        .send(uploadsSkipped);
            } else res.status(201).send(uploads);
        } catch (e) {
            res.status(400).send(e);
        }
    }
});

// Authenticated user votes for a specific photo of an upload 
router.patch("/uploads/vote", auth, async (req, res) => {
    try {
        // Find the upload that user interacts with
        const uploadToVote = await Upload.findById(req.body.id1).select(
            "visited skipped photos totalvotes finalDate"
        );
        // Find if user has already seen that upload again
        const alreadyVisited = await uploadToVote.visited.find(
            (user) => user.id === req.user.id
        );

        // Find if user has already skipped that upload
        const alreadySkipped = await uploadToVote.skipped.find(
            (user) => user.id === req.user.id
        );
        
        // Check that user has not already interacted with that upload again and do the neccesary changes
        if (!alreadyVisited || alreadySkipped) {
            let counter, photo;
            for (let i = 0; i < uploadToVote.photos.length; i++) {
                counter = i;
                if (uploadToVote.photos[i].id === req.body.id2) {
                    photo = uploadToVote.photos[i];
                    break;
                }
            }

            try {
                // Creates the votedUpload object and pushes it in user model
                let votedUpload = {
                    _id: uploadToVote._id,
                    votedPhoto: counter,
                    expiredDate: uploadToVote.finalDate,
                };
                req.user.votedUploads.push(votedUpload);
                req.user.level++;
                await req.user.save();
                // Increase the number of votes for the selected photo
                photo.votes++;
                uploadToVote.totalvotes++;
                if (!alreadyVisited) {
                    uploadToVote.visited.push(req.user.id);
                }
                //when a skippedUpload is being voted , here we have to delete it from skippedArray
                if (alreadySkipped) {
                    const newSkippedArray = uploadToVote.skipped.filter(
                        (item) => {
                            return item._id != req.user.id;
                        }
                    );
                    uploadToVote.skipped = newSkippedArray;
                }
                // Save the changes of the current upload
                await uploadToVote.save();
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(400);
        }
    } catch (e) {
        res.sendStatus(500);
    }
});

// Authenticated user skips a specific upload 
router.patch("/uploads/skip", auth, async (req, res) => {
    try {
       // Find the upload that user interacts with
        const upload = await Upload.findById(req.body.id1).select(
            "visited skipped"
        );
        // Check if user has already seen that upload
        const alreadyVisited = await upload.visited.find(
            (user) => user.id === req.user.id
        );
        if (!alreadyVisited) {
            // Add user to visited and skipped array
            upload.visited.push(req.user.id);
            upload.skipped.push(req.user.id);
            await upload.save();
        } else {
            // Modify the skip array
            const newSkippedArray = upload.skipped.filter((item) => {
                return item._id != req.user.id;
            });
            upload.skipped = newSkippedArray;
            // Save the changes of the current Upload
            await upload.save();
        }
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
});

//Authenticated user converts a specific upload from active to inactive state
router.patch("/uploads/active", auth, async (req, res) => {
    try {
        const upload = await Upload.findById(req.body.id).select("active date");
        upload.active = false;
        upload.date = new Date();
        await upload.save();
        res.status(200).send(upload._id);
    } catch (e) {
        res.sendStatus(500);
    }
});

//Authenticated user deletes a specific upload 
router.delete("/uploads/deleteUpload", auth, async (req, res) => {
    try {
        await Upload.deleteOne({ _id: req.body.id });
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(404);
    }
});

// Authenticated user deletes a specific photo for an upload 
router.delete("/uploads/deletePhoto", auth, async (req, res) => {
    try {
        // Find the upload that user interacts with
        const upload = await Upload.findById(req.body.id1);
        try {
            // Find and remove the photo with specific id
            let newArray = [];
            let removedItemVotes = 0;
            upload.photos.forEach((item) => {
                if (item._id.toString() !== req.body.id2) {
                    newArray.push(item);
                } else {
                    removedItemVotes = item.votes;
                }
            });
            // Update the photos array with the new one
            upload.photos = newArray;
            if (upload.totalvotes !== 0) {
                // Update the number of totalvotes with the correct one
                upload.totalvotes -= removedItemVotes;
            }
            // Save the new photos array for the upload
            await upload.save();
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(406);
        }
    } catch (e) {
        res.sendStatus(404);
    }
});

// Authenticated user makes a report for a specific upload 
router.patch("/uploads/reported", auth, async (req, res) => {
    try {
       // Find the upload that user interacts with
        const upload = await Upload.findById(req.body.id1);
        try {
            // Add the user Id to the reported list and increase the number of reports for the specific upload
            upload.reported.push(req.user.id);
            upload.numberOfReported++;
            await upload.save();
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(401);
        }
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;
