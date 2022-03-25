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
    limits: {
        fileSize: 100000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|JPG)$/)) {
            return cb(new Error("Please upload an image"));
        }
        cb(undefined, true);
    },
});

// Upload poll using multer
router.post("/uploads", auth, upload.array("photos", 6), async (req, res) => {
    let photos = await Promise.all(
        // For every photo initialise fields
        req.files.map(async (file) => {
            let data;
            try {
                let dimensions = sizeOf(file.buffer);
                const imageUrl = await uploadImage(file);
                if (
                    imageUrl === null ||
                    dimensions.width === 0 ||
                    dimensions.height === 0
                ) {
                    throw new Error();
                } else {
                    data = {
                        uri: imageUrl,
                        votes: 0,
                        width: dimensions.width,
                        height: dimensions.height,
                    };
                }
            } catch (e) {
                console.log("Upload 402 error is :", e);
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

// Upload profile picture
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
            if (imageUrl === null) {
                throw new Error();
            } else {
                data = { Thumbnail: imageUrl };
            }
        } catch (error) {
            res.sendStatus(402);
        }
        try {
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

// Return all the uploads of the user, sorted by date
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


router.patch("/uploads/vote", auth, async (req, res) => {
    try {
        const uploadToVote = await Upload.findById(req.body.id1).select(
            "visited skipped photos totalvotes finalDate"
        );
        const alreadyVisited = await uploadToVote.visited.find(
            (user) => user.id === req.user.id
        );
        const alreadySkipped = await uploadToVote.skipped.find(
            (user) => user.id === req.user.id
        );
        if (!alreadyVisited || alreadySkipped) {
            //const photo = await uploadToVote.photos.find(photo => photo.id === req.body.id2);
            let counter, photo;
            for (let i = 0; i < uploadToVote.photos.length; i++) {
                counter = i;
                if (uploadToVote.photos[i].id === req.body.id2) {
                    photo = uploadToVote.photos[i];
                    break;
                }
            }

            try {
                let votedUpload = {
                    _id: uploadToVote._id,
                    votedPhoto: counter,
                    expiredDate: uploadToVote.finalDate,
                };
                req.user.votedUploads.push(votedUpload);
                req.user.level++;
                await req.user.save();
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
                //
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

router.patch("/uploads/skip", auth, async (req, res) => {
    try {
        const upload = await Upload.findById(req.body.id1).select(
            "visited skipped"
        );
        const alreadyVisited = await upload.visited.find(
            (user) => user.id === req.user.id
        );
        if (!alreadyVisited) {
            upload.visited.push(req.user.id);
            upload.skipped.push(req.user.id);
            await upload.save();
        } else {
            const newSkippedArray = upload.skipped.filter((item) => {
                return item._id != req.user.id;
            });
            upload.skipped = newSkippedArray;
            await upload.save();
        }
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
});

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

router.delete("/uploads/deleteUpload", auth, async (req, res) => {
    try {
        await Upload.deleteOne({ _id: req.body.id });
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(404);
    }
});

router.delete("/uploads/deletePhoto", auth, async (req, res) => {
    try {
        const upload = await Upload.findById(req.body.id1);
        try {
            let newArray = [];
            let removedItemVotes = 0;
            upload.photos.forEach((item) => {
                if (item._id.toString() !== req.body.id2) {
                    newArray.push(item);
                } else {
                    removedItemVotes = item.votes;
                }
            });
            upload.photos = newArray;
            if (upload.totalvotes !== 0) {
                upload.totalvotes -= removedItemVotes;
            }
            await upload.save();
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(406);
        }
    } catch (e) {
        res.sendStatus(404);
    }
});

router.patch("/uploads/reported", auth, async (req, res) => {
    try {
        const upload = await Upload.findById(req.body.id1);
        try {
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
