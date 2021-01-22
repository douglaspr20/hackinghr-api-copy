module.exports = {
  AWS: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  S3: {
    IMAGE_BUCKET_NAME: "lab-user-images",
    IMAGE_BUCKET_URL: "https://lab-user-images.s3.us-east-2.amazonaws.com",
    PROFILE_IMAGE_FOLDER: "profile",
    EVENT_IMAGE_FOLDER: "event",
    LIBRARY_IMAGE_FOLDER: "library",
    PODCAST_IMAGE_FOLDER: "podcast",
  },
};
