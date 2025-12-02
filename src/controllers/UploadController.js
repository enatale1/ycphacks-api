// uploadController.js (CommonJS format)
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Define the endpoint for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACE_ENDPOINT);

// Configure AWS.S3 with credentials
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_ACCESS_KEY,
    secretAccessKey: process.env.DO_SECRET_KEY,
});

// Multer middleware setup
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.DO_SPACE_NAME,
        acl: "public-read",
        key: function (req, file, cb) {
            cb(null, `uploads/${Date.now()}_${file.originalname}`);
        },
    }),
});

module.exports = upload;