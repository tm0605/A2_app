const sharp = require('sharp');

const photoEdit = (req, res, next) => {
    let start = Date.now();
    var files = req.files.photos
    // console.log(files)
    if (!(files instanceof Array)) { // If single photo add it in an array
        files = [files];
    }

    var photos = [];
    var px = 100;
    var ratio = 0.1;

    greyscale(files)
    .then(() => {
        let time = Date.now() - start;
        console.log(`greyscale processing: ${time}ms`);
        req.gsPhotos = photos;
        photos = [];
        start = Date.now();
        resizeByPixel(files, px)
        .then(() => {
            time = Date.now() - start;
            console.log(`resize by pixel of ${px} processing: ${time}ms`);
            req.resizeByPixel = photos;
            photos = [];
            start = Date.now();
            resizeByRatio(files, ratio)
            .then(() => {
                time = Date.now() - start;
                console.log(`resize by ratio of ${ratio} processing: ${time}ms`)
                req.resizeByRatio = photos;
                photos = [];
                start = Date.now();
                resizeHalf(files)
                .then(() => {
                    time = Date.now() - start;
                    console.log(`resize half processing: ${time}ms`);
                    req.resizeHalf = photos;
                    photos = [];
                    next();
                })
            })

        })
    })

    function greyscale(photoset) {
        return new Promise((resolve, reject) => {
            console.log('starting greyscale processing')
            // console.log(photoset)
            for (let n = 0; n < photoset.length; ++n) {
                const image = sharp(photoset[n].data);
                image.greyscale()
                .toBuffer()
                .then((data) => {
                    photos.push(data)
                    if (n == photoset.length - 1) {
                        resolve();
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
            }
        })
    }

    function resizeByPixel(photoset, px) {
        return new Promise((resolve, reject) => {
            console.log('starting resize process')
            for (let n = 0; n < photoset.length; ++n) {
                const image = sharp(photoset[n].data);
                image.resize({ width: px })
                .toBuffer()
                .then((data) => {
                    photos.push(data)
                    if (n == photoset.length - 1) {
                        resolve();
                    }
                })
                .catch((error) => {
                    console.log(error);
                })
            }
        })
    }

    function resizeByRatio(photoset, ratio) {
        return new Promise((resolve, reject) => {
            console.log(`starting half resize process`)
            for (let n = 0; n < photoset.length; ++n) {
                const image = sharp(photoset[n].data);
                image.metadata()
                .then(({ width }) => {
                    image.resize(Math.round(width * ratio))
                    .toBuffer()
                    .then((data) => {
                        photos.push(data)
                        if (n == photoset.length - 1) {
                            resolve();
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                })
            }
        })

    }

    function resizeHalf(photoset) {
        return new Promise((resolve, reject) => {
            console.log(`starting half resize process`)
            for (let n = 0; n < photoset.length; ++n) {
                const image = sharp(photoset[n].data);
                image.metadata()
                .then(({ width }) => {
                    image.resize(Math.round(width * 0.5))
                    .toBuffer()
                    .then((data) => {
                        photos.push(data)
                        if (n == photoset.length - 1) {
                            resolve();
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                })
            }
        })

    }
}



module.exports = photoEdit