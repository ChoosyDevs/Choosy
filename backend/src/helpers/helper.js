const gc = require("../../config/");

// Connect to Google Cloud bucket
const bucket = gc.bucket(process.env.GC_BUCKET);

// Function to save image in google cloud
const uploadImage = (file) =>
    new Promise(async (resolve, reject) => {
        const { originalname, buffer } = file;

        const blob = bucket.file(Date.now() + originalname.replace(/ /g, "_"));

        // Send file through write stream
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        // Return the url to the file when done
        blobStream
            .on("finish", () => {
                const publicUrl =
                    "https://storage.googleapis.com/" +
                    bucket.name +
                    "/" +
                    blob.name;
                resolve(publicUrl);
            })
            .on("error", (error) => {
                reject("Unable to upload image, something went wrong");
            })
            .end(buffer);
    });

module.exports = uploadImage;
