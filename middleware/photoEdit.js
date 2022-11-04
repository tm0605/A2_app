const sharp = require("sharp");
require('dotenv').config();
const AWS = require('aws-sdk');

// S3 setup
const bucketName = "A2_ImageStore";
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

s3.createBucket({ Bucket: bucketName })
.promise()
.then(() => console.log(`Created bucket: ${bucketName}`))
.catch((err) => {
    // We will ignore 409 errors which indicate that the bucket already exists
    if (err.statusCode !== 409) {
        console.log(`Error creating bucket: ${err}`);
    }
});




const photoEdit = (req, res, next) => {
  var files = req.files.photos;
  // console.log(files)

    // If single photo add it in an array
  if (!(files instanceof Array)) {
    files = [files];
  }

  const saved = req.saved;
  const processing = req.query.processing;
  const photos = [];

  greyscale(files).then(() => {

    resizeHalf(files).then(() => {

      sharpen(files).then(() => {

        blur(files).then(() => {
          
          req.editedPhotos = photos;
          next();
        });
      });
    });
  });

  function greyscale(photoset) {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'greyscale') {
        let start = Date.now();
        console.log("starting greyscale processing");
        // console.log(photoset)
        for (let n = 0; n < photoset.length; ++n) {
          const image = sharp(photoset[n].data);
          image
          .greyscale()
          .toBuffer()
          .then((data) => {
            photos.push(data);
            if (n == photoset.length - 1) {
              let time = Date.now() - start;
              console.log(`greyscale processing: ${time}ms`);
              resolve();
            }
          })
          .catch((error) => {
            console.log(error);
          });
        }
      }
      else {
        resolve();
      }
    });
  }

  function resizeHalf(photoset) {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'resize') {

        let start = Date.now();
        console.log(`starting half resize process`);
        for (let n = 0; n < photoset.length; ++n) {
          const image = sharp(photoset[n].data);
          image.metadata().then(({ width }) => {
            image
            .resize(Math.round(width * 0.5))
            .toBuffer()
            .then((data) => {
              photos.push(data);
              if (n == photoset.length - 1) {
                let time = Date.now() - start;
                console.log(`resize half processing: ${time}ms`);
                resolve();
              }
            })
            .catch((error) => {
              console.log(error);
            });
          });
        }
      }
      else {
        resolve();
      }
    });
  }

  function sharpen(photoset) {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'sharpen') {

        let start = Date.now();
        console.log("starting sharpen process");
        for (let n = 0; n < photoset.length; ++n) {
          const image = sharp(photoset[n].data);
          image
          .sharpen({ sigma: 20 })
          .toBuffer()
          .then((data) => {
            photos.push(data);
            if (n == photoset.length - 1) {
              let time = Date.now() - start;
              console.log(`sharpen processing: ${time}ms`);
              resolve();
            }
          })
          .catch((error) => {
            console.log(error);
          });
        }
      }
      else {
        resolve();
      }
    });
  }

  function blur(photoset) {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'blur') {

        let start = Date.now();
        console.log("starting blur process");
        for (let n = 0; n < photoset.length; ++n) {
          const image = sharp(photoset[n].data);
          image
          .blur(20)
          .toBuffer()
          .then((data) => {
            photos.push(data);
            if (n == photoset.length - 1) {
              let time = Date.now() - start;
              console.log(`blur processing: ${time}ms`);
              resolve();
            }
          })
          .catch((error) => {
            console.log(error);
          });
        }
      }
      else {
        resolve();
      }
    });
  }

  // function uploadRedis(hash) {
  //   redisClient.setEx(

  //   )
  // }

  function uploadS3(hash) {
    const s3Key = ``;
    const buffer = ``;
    const objectParams = { Bucket: bucketName, Key: s3Key, Body: buffer}
    s3.putObject(objectParams)
    .promise()
    .then(() => {
      console.log(
          `Successfully uploaded data to ${bucketName}/${s3Key}`
      );
    })
    .catch((err) => {
        console.log(err,err.stack);
    });
  }

  function getS3(hash) {
    const params = { Bucket: bucketName, Key: s3Key }
    s3.getObject(params)
    .promise()
    .then((result) => {
      return result
    })
    .catch((err) => {
      console.log(err,err.stack)
    })
  }
};

module.exports = photoEdit;
