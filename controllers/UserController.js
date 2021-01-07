const db = require("../models");
const profileUtils = require("../utils/profile");
const HttpCodes = require("http-codes");
const AWS = require("aws-sdk");

const getImgBuffer = require("../utils/getImageBuffer");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const UserImageBucketName = "lab-user-images";
const userImageBucket = new AWS.S3({ params: { Bucket: UserImageBucketName } });
const s3Url = "https://lab-user-images.s3.us-east-2.amazonaws.com";

const User = db.User;

const UserController = () => {
  const getUser = async (req, res) => {
    const { id } = req.query;

    if (id) {
      try {
        const user = await User.findOne({
          where: {
            id,
          },
        });

        if (!user) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: User not found" });
        }

        return res.status(HttpCodes.OK).json({ user });
      } catch (error) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: user id is wrong" });
    }
  };

  const updateUser = async (req, res) => {
    let user = req.body;
    const { id } = req.query;

    if (user) {
      try {
        if (user.imageStr) {
          const imageUrl = await getImageUrl(
            "profile",
            user.img,
            user.imageStr
          );
          user.img = imageUrl;
        }
        user.percentOfCompletion = profileUtils.getProfileCompletion(user);
        user.completed = user.percentOfCompletion === 100;
        user.abbrName = `${(user.firstName || "").slice(0, 1).toUpperCase()}${(
          user.lastName || ""
        )
          .slice(0, 1)
          .toUpperCase()}`;

        const [numberOfAffectedRows, affectedRows] = await User.update(user, {
          where: { id },
          returning: true,
          plain: true,
        });

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

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
          resolve(`${s3Url}/${path}`);
        }
      });
    });
  };

  const deleteUserPicture = (url) => {
    if (url) {
      const path = url.slice(s3Url.length + 1);
      const params = {
        Bucket: UserImageBucketName,
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

  const getImageUrl = async (folder = "profile", prevImg, base64Image) => {
    const buffer = getImgBuffer(base64Image);
    const currentTime = new Date().getTime();
    // delete previous image from s3 bucket
    if (prevImg) {
      await deleteUserPicture(prevImg);
    }
    return imageUpload(`${folder}/${currentTime}.jpeg`, buffer);
  };

  return {
    getUser,
    updateUser,
  };
};

module.exports = UserController;
