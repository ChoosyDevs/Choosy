const express = require('express');
const User = require('../models/user')
const Upload = require('../models/upload')
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')
const router = new express.Router();


router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/me/level', auth, async (req, res) => {
    res.send(req.user.level)
})

// router.get('/users/search', (req, res) => {
//   try {
//     const array = []
//     const searchedField = req.query.username;
//         // User.find({name:{$regex: searchedField }})
//     let regexp = new RegExp(`</^${searchedField}/>`); 
//     User.find({name:regexp})
//     .then(data => {
//       data.map((dat,i) => {
//         array.push(data[i].name)
//       })
//       res.send(array)
//     })
//   }
//   catch(e) {
//     res.status(400).send(e)
//     } 
//   })


router.post('/users/checkEmail', async (req, res) => {
    const email =  req.body.email;
    const user = await User.findOne({email})
    if(user) {
      if(user.banned === false) {
        res.sendStatus(400)
      }
      else {
        res.sendStatus(401)
      }
    }
    else {
        res.sendStatus(200)
    }
})

router.post('/users/checkName',async (req, res) => {
    const name =  req.body.name;
    const user = await User.findOne({name})
    if(user) {
      if(user.banned === false) {
        res.sendStatus(400)
      }
      else {
        res.sendStatus(401)
      }
    }
    else {
        res.sendStatus(200)
    }
})

router.patch('/users/name', auth, async (req, res) => {
  const name =  req.body.name;
    const user = await User.findOne({name})
    if(user) {
        res.sendStatus(400)
    }
    else {
      try {
       req.user.name = name
       let conditions = {owner:req.user._id};
       let update = {
           $set : {
             "ownerName":name
         }
       };
       let options = { multi: true };
       Upload.updateMany(
         conditions, update, options,(err, doc) => {
             if(err) throw new Error();
         });    
        await req.user.save()
        res.sendStatus(200)
    } catch (e) {
        res.sendStatus(500)
    }
    }
})


router.patch('/users/targetAgeGroups', auth, async (req, res) => {
  try {
     req.user.targetAgeGroups = req.body.targetAgeGroups
      await req.user.save()
      res.sendStatus(200)
  } catch (e) {
      res.sendStatus(400)
  }
})


router.patch('/users/instagramName', auth, async (req, res) => {
    try {
        req.user.instagramName = req.body.instagramName
        let conditions = {owner:req.user._id};
        let update = {
            $set : {
              "ownerInstagramName":req.body.instagramName
          }
        };
        let options = { multi: true };
        Upload.updateMany(
          conditions, update, options,(err, doc) => {
              if(err) throw new Error();    
          });
        await req.user.save()
        res.sendStatus(200)
    } catch (e) {
      console.log('error change ista name is:',e)
        res.sendStatus(400)
    }
})

router.patch('/users/instaIntro', auth, async (req, res) => {
  try {
      req.user.instaIntro = true
      await req.user.save()
      res.sendStatus(200)
  } catch (e) {
      res.sendStatus(400)
  }
})

router.patch('/users/email', auth, async (req, res) => {
  const email =  req.body.email;
    const user = await User.findOne({email})
    if(user) {
        res.sendStatus(400)
    }
    else {
      try {
       req.user.email = email
        await req.user.save()
        res.sendStatus(200)
    } catch (e) {
        res.sendStatus(500)
    }
    }
})

     router.patch('/users/hatedUsers', auth, async (req, res) => {
        
        try{
          req.user.hatedUsers.push(req.body.id)
          await req.user.save()
          res.sendStatus(200)
        }
        catch(e){
            res.sendStatus(401)
        } 
     })


router.patch('/users/password', auth, async (req, res) => {

    try {
         const isMatch = await bcrypt.compare(req.body.password, req.user.password)
         if(isMatch) {   
            res.sendStatus(200)       
         }
        else {
         throw new Error()
            }
    }
    catch (e) {
            res.sendStatus(400)       
        }
})

router.patch('/users/changePassword', auth, async (req, res) => {
    try {
       req.user.password = req.body.password
       await req.user.save()
       res.sendStatus(200)
    }
    catch (e) {
            res.sendStatus(400)       
        }
})


router.get('/users/me/banned', auth, async (req, res) => {
    res.send(req.user.banned)
})


router.get('/users/number', async (req,res) => {
  try{
    const number = await User.countDocuments()
    res.status(201).send(number.toString());
  }
  catch(e){
    res.sendStatus(400)
  }
})


router.patch('/users/increaseBans', async (req, res) => {
    try {
      const user = await User.findById(req.body.id)
      user.numberOfBanned ++
      if(user.numberOfBanned === 3) {
        //edo einai o arithmos ton ban pou tha orisoume gia na ton banaroune
        user.banned = true
        user.tokens = []
      }
      await user.save()
      res.sendStatus(200)
    }
    catch (e) {
      res.sendStatus(400)       
  }
})

router.patch('/users/ban', async (req, res) => {
    try {
      const user = await User.findById(req.body.id)   
      user.banned = true
      user.tokens = []
      let conditions = {owner:user._id};
      let update = {
          $set : {
            "active":false
        }
      };
      let options = { multi: true };
      Upload.updateMany(
        conditions, update, options,(err, doc) => {
            if(err) throw new Error();    
        });
      await user.save()
      res.sendStatus(200)
    }
    catch (e) {
        res.sendStatus(400)       
    }
  })  

  router.patch('/users/shadowBan', async (req, res) => {
    try {
      const user = await User.findById(req.body.id)   
      user.shadowBanUser = true
      let conditions = {owner:user._id};
      let update = {
          $set : {
            "shadowBanUpload":true
        }
      };
      let options = { multi: true };
      Upload.updateMany(
        conditions, update, options,(err, doc) => {
            if(err) throw new Error();    
        });
      await user.save()
      res.sendStatus(200)
    }
    catch (e) {
        res.sendStatus(400)       
    }
  })  


module.exports = router