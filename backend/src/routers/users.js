const express = require("express");
const User = require("../models/user");
const Upload = require("../models/upload");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const router = new express.Router();

// Sends the entire user object
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Changes the name of an authenticated user
router.patch("/users/name", auth, async (req, res) => {
  const name = req.body.name;
  // Stores in user variable the user object if exists
  const user = await User.findOne({ name });
  if (user) {
    // If that name exists in another user do not update the name
    res.sendStatus(400);
  } else {
    // Update the user's name everywhere
    try {
      req.user.name = name;
      let conditions = { owner: req.user._id };
      let update = {
        $set: {
          ownerName: name,
        },
      };
      let options = { multi: true };
      Upload.updateMany(conditions, update, options, (err, doc) => {
        if (err) throw new Error();
      });
      await req.user.save();
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(500);
    }
  }
});

// Changes the targetAgeGroups of an authenticated user
router.patch("/users/targetAgeGroups", auth, async (req, res) => {
  try {
    req.user.targetAgeGroups = req.body.targetAgeGroups;
    await req.user.save();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});

// Changes the email of an authenticated user
router.patch("/users/email", auth, async (req, res) => {
  const email = req.body.email;
  // Find if the previous email is related to a user
  const user = await User.findOne({ email });
  if (user) {
    res.sendStatus(400);
  } else {
    try {
      // Update email in DB
      req.user.email = email;
      await req.user.save();
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(500);
    }
  }
});

// Updates the hatedUsers list of an authenticated user
router.patch("/users/hatedUsers", auth, async (req, res) => {
  try {
    req.user.hatedUsers.push(req.body.id);
    await req.user.save();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(401);
  }
});

// Checks if the receiving password is matching with the saved
router.patch("/users/password", auth, async (req, res) => {
  try {
    // Compare two passwords with the password-hashing function
    const isMatch = await bcrypt.compare(req.body.password, req.user.password);
    if (isMatch) {
      res.sendStatus(200);
    } else {
      throw new Error();
    }
  } catch (e) {
    res.sendStatus(400);
  }
});

// Updates the user's password in DB with the new one 
router.patch("/users/changePassword", auth, async (req, res) => {
  try {
    req.user.password = req.body.password;
    await req.user.save();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});

// Increase the number of bans for a specific user until user reaches three bans where he is totally banned
router.patch("/users/increaseBans", async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    user.numberOfBanned++; 
    if (user.numberOfBanned === 3) {
      user.banned = true;
      user.tokens = [];
    }
    await user.save();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});

// User is totally banned from the report system due to inappropriate uploads
router.patch("/users/ban", async (req, res) => {
  try {
    // Find that user and clean everything related to that user
    const user = await User.findById(req.body.id);
    user.banned = true;
    user.tokens = [];
    let conditions = { owner: user._id };
    let update = {
      $set: {
        active: false,
      },
    };
    let options = { multi: true };
    Upload.updateMany(conditions, update, options, (err, doc) => {
      if (err) throw new Error();
    });
    await user.save();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(400);
  }
});


module.exports = router;
