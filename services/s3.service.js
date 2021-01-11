const AWS = require("aws-sdk");
const { Buffer } = require("buffer");
const { AWSConfig } = require("../enum");

AWS.config.update(AWSConfig.AWS);
const { S3 } = AWSConfig;

const userImageBucket = new AWS.S3({
  params: { Bucket: S3.IMAGE_BUCKET_NAME },
});

const s3Service = () => {
  const imageUpload = (path, buffer) => {
    const data = {
      Key: path,
      Body: buffer,
      ACL: "public-read",
      ContentType: "image/jpeg",
      ContentEncoding: "base64",
    };

    return new Promise((resolve, reject) => {
      userImageBucket.putObject(data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(`${S3.IMAGE_BUCKET_URL}/${path}`);
        }
      });
    });
  };

  const deleteUserPicture = (url) => {
    if (url) {
      const path = url.slice(S3.IMAGE_BUCKET_URL.length + 1);
      const params = {
        Bucket: S3.IMAGE_BUCKET_NAME,
        Key: path,
      };

      return new Promise((resolve, reject) => {
        userImageBucket.deleteObject(params, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve("success");
          }
        });
      });
    }
    return;
  };

  const getImgBuffer = (base64) => {
    const base64str = base64.replace(/^data:image\/\w+;base64,/, "");

    return Buffer.from(base64str, "base64");
  };

  const getImageUrl = async (
    folder = S3.PROFILE_IMAGE_FOLDER,
    prevImg,
    base64Image
  ) => {
    const buffer = getImgBuffer(base64Image);
    const currentTime = new Date().getTime();
    // delete previous image from s3 bucket
    if (prevImg) {
      await deleteUserPicture(prevImg);
    }
    return imageUpload(`${folder}/${currentTime}.jpeg`, buffer);
  };

  return {
    getImageUrl,
    deleteUserPicture,
  };
};

module.exports = s3Service;
