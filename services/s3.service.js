const AWS = require("aws-sdk");
const { Buffer } = require("buffer");
const { AWSConfig } = require("../enum");

AWS.config.update(AWSConfig.AWS);
const { S3 } = AWSConfig;

const userImageBucket = new AWS.S3({
  params: { Bucket: S3.IMAGE_BUCKET_NAME },
});

const resumeBucket = new AWS.S3({
  params: { Bucket: S3.RESUME_BUCKET_NAME },
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

  const getUserImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.PROFILE_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getEventImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(S3.EVENT_IMAGE_FOLDER, prevImg, base64Image);

    return url;
  };

  const getLibraryImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.LIBRARY_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getPodcastImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.PODCAST_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getCourseImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(S3.COURSE_IMAGE_FOLDER, prevImg, base64Image);

    return url;
  };

  const getMarketplaceImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.MARKETPLACE_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getChannelImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.CHANNEL_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getSponsorImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.SPONSOR_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getInstructorImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.INSTRUCTOR_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getPostImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(S3.POST_IMAGE_FOLDER, prevImg, base64Image);

    return url;
  };

  const getPartnerImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.PARTNER_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const uploadResume = async (file, user) => {
    const fileName = `${user.id}_${
      process.env.S3_RESUME_BUCKET || "local"
    }_resume`;
    const { mimetype } = file;
    const params = {
      Key: fileName,
      Body: file.data,
      ContentType: mimetype,
      ACL: "public-read",
    };

    return new Promise((resolve, reject) => {
      resumeBucket.upload(params, (err, data) =>
        err === null ? resolve(data) : reject(err)
      );
    });
  };

  const deleteResume = async (url) => {
    if (url) {
      const path = url.split("/")[url.split("/").length - 1];
      const params = {
        Bucket: S3.RESUME_BUCKET_NAME,
        Key: path,
      };

      return new Promise((resolve, reject) => {
        resumeBucket.deleteObject(params, (err) => {
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

  const getSkillCohortImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.SKILL_COHORT_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  const getJobPostImageUrl = async (prevImg, base64Image) => {
    const url = await getImageUrl(
      S3.JOB_POST_IMAGE_FOLDER,
      prevImg,
      base64Image
    );

    return url;
  };

  return {
    getImageUrl,
    getUserImageUrl,
    getEventImageUrl,
    getLibraryImageUrl,
    getPodcastImageUrl,
    getMarketplaceImageUrl,
    getChannelImageUrl,
    getCourseImageUrl,
    deleteUserPicture,
    getSponsorImageUrl,
    getInstructorImageUrl,
    getPostImageUrl,
    getSkillCohortImageUrl,
    getPartnerImageUrl,
    uploadResume,
    deleteResume,
    getJobPostImageUrl,
  };
};

module.exports = s3Service;
