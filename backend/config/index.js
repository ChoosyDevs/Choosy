const Cloud = require('@google-cloud/storage')
const path = require('path')
const serviceKey = path.join(__dirname, './KEY_PATH.json')

const { Storage } = Cloud

// Google cloud storage connection 
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: 'KEY_NAME',
})

module.exports = storage