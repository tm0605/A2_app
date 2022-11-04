const sharp = require("sharp");
require('dotenv').config();
const AWS = require('aws-sdk');

// S3 setup
const bucketName = "a2-imagestore";
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
  // console.log(saved)
  const processing = req.query.processing;
  const photos = [];

  greyscale().then(() => { // Greyscale process

    resizeHalf().then(() => { // Resize process

      sharpen().then(() => { // Sharpen process

        blur().then(() => { // Blur process
          
          req.editedPhotos = photos; // Assign to req
          next();
        });
      });
    });
  });

  function greyscale() {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'greyscale') { // Only perform for these process
        var p = 0;
        if (processing == 'all') { // Index reference for all process
          p = 0;
        }
        let start = Date.now();
        console.log("starting greyscale processing");
        // console.log(files)
        for (let n = 0; n < files.length; ++n) { // Loop for the number of images
          if (saved[p * files.length + n]) { // If marked saved
            getS3('greyscale', n) // Serve from s3
            .then((result) => {
              photos.push(result); // Append to array
              if (n == files.length - 1) { // If last image
                let time = Date.now() - start;
                console.log(`greyscale processing: ${time}ms`);
                resolve(); // End
              }
            })
          }
          else { // If not saved
            const image = sharp(files[n].data); // Process image
            image
            .greyscale()
            .toBuffer()
            .then((data) => {
              uploadS3('greyscale', data, n) // Upload to s3
              .then(() => {
                photos.push(data); // Append to array
                if (n == files.length - 1) { // If last image
                  let time = Date.now() - start;
                  console.log(`greyscale processing: ${time}ms`);
                  resolve(); // End
                }
              })
            })
            .catch((error) => {
              console.log(error);
            });
          }
        }
      }
      else {
        resolve();
      }
    });
  }

  function resizeHalf() {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'resize') { // Only perform for these process
        var p = 0;
        if (processing == 'all') {  // Index reference for all process
          p = 1;
        }

        let start = Date.now();
        console.log(`starting half resize process`);
        for (let n = 0; n < files.length; ++n) { // Loop for the number of images
          if (saved[p * files.length + n]) { // If marked saved
            getS3('resize', n) // Serve from s3
            .then((result) => {
              photos.push(result); // Append to array
              if (n == files.length - 1) { // If last image
                let time = Date.now() - start;
                console.log(`resize half processing: ${time}ms`);
                resolve(); // End
              }
            })
          }
          else { // If not saved
            const image = sharp(files[n].data); // Process image
            image.metadata().then(({ width }) => {
              image
              .resize(Math.round(width * 0.5))
              .toBuffer()
              .then((data) => {
                uploadS3('resize', data, n) // Upload to s3
                .then(() => {
                  photos.push(data); // Append to array
                  if (n == files.length - 1) { // If last image
                    let time = Date.now() - start;
                    console.log(`resize half processing: ${time}ms`);
                    resolve(); // End
                  }
                })
              })
              .catch((error) => {
                console.log(error);
              });
            });

          }
        }
      }
      else {
        resolve();
      }
    });
  }

  function sharpen() {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'sharpen') { // Only perform for these process
        var p = 0;
        if (processing == 'all') { // Index reference for all process
          p = 2;
        }

        let start = Date.now();
        console.log("starting sharpen process");
        for (let n = 0; n < files.length; ++n) { // Loop for the number of images
          if (saved[p * files.length + n]) { // If marked saved
            getS3('sharpen', n) // Serve from s3
            .then((result) => {
              photos.push(result); // Append to array
              if (n == files.length - 1) { // If last image
                let time = Date.now() - start;
                console.log(`sharpen processing: ${time}ms`);
                resolve(); // End
              }
            })
          }
          else { // If not saved
            const image = sharp(files[n].data); // Process image
            image
            .sharpen({ sigma: 20 })
            .toBuffer()
            .then((data) => {
              uploadS3('sharpen', data, n) // Upload to s3
              .then(() => {
                photos.push(data); // Append to array
                if (n == files.length - 1) { // If last image
                  let time = Date.now() - start;
                  console.log(`sharpen processing: ${time}ms`);
                  resolve(); // End
                }
              })
            })
            .catch((error) => {
              console.log(error);
            });

          }
        }
      }
      else {
        resolve();
      }
    });
  }

  function blur() {
    return new Promise((resolve, reject) => {
      if (processing == 'all' || processing == 'blur') { // Only perform for these process
        var p = 0;
        if (processing == 'all') { // Index reference for all process
          p = 3;
        }

        let start = Date.now();
        console.log("starting blur process");
        for (let n = 0; n < files.length; ++n) { // Loop for the number of images
          if (saved[p * files.length + n]) { // If marked saved
            getS3('blur', n) // Serve from s3
            .then((result) => {
              photos.push(result); // Append to array
              if (n == files.length - 1) { // If last image
                let time = Date.now() - start;
                console.log(`blur processing: ${time}ms`);
                resolve(); // End
              }
            })
          }
          else { // If not saved
            const image = sharp(files[n].data); // Process image
            image
            .blur(20)
            .toBuffer()
            .then((data) => {
              uploadS3('blur', data, n) // Upload to s3
              .then(() => {
                photos.push(data); // Append to array
                if (n == files.length - 1) { // If last image
                  let time = Date.now() - start;
                  console.log(`blur processing: ${time}ms`);
                  resolve(); // End
                }
              })
            })
            .catch((error) => {
              console.log(error);
            });
          }
        }
      }
      else {
        resolve();
      }
    });
  }


  function uploadS3(process, buffer, index) {
    return new Promise((resolve, reject) => {
      const s3Key = process + '_' + files[index].md5;
      const objectParams = { Bucket: bucketName, Key: s3Key, Body: buffer}
      s3.putObject(objectParams) // Upload to s3
      .promise()
      .then(() => {
        console.log(
            `Successfully uploaded data to ${bucketName}/${s3Key}`
        );
        resolve();
      })
      .catch((err) => {
          console.log(err,err.stack);
      });
    })
  }

  function getS3(process, index) {
    return new Promise((resolve, reject) => {
      const s3Key = process + '_' + files[index].md5;
      const params = { Bucket: bucketName, Key: s3Key }
      s3.getObject(params) // Retrieve from s3
      .promise()
      .then((result) => {
        resolve(result.Body)
      })
      .catch((err) => {
        console.log(err,err.stack)
      })
    })
  }
};

module.exports = photoEdit;
