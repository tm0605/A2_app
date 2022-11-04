const base64Conversion = (req, res, next) => {
  const bufPhotos = req.editedPhotos;
  const b64Photos = [];

  convLoop(bufPhotos) // Convert all photos
    .then(() => {
      req.b64Photos = b64Photos;
      next()
    });

  function convLoop(photoset) {
    return new Promise((resolve, reject) => {
      for (let n = 0; n < photoset.length; ++n) {
        b64Conv(photoset[n]).then(() => {
          if (n == photoset.length - 1) {
            resolve();
          }
        });
      }
    });
  }

  function b64Conv(photo) {
    return new Promise((resolve, reject) => {
      var b64Photo = photo.toString("base64");
      b64Photos.push(b64Photo);
      resolve();
    });
  }
};

module.exports = base64Conversion;
