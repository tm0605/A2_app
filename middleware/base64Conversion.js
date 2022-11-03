const base64Conversion = (req, res, next) => {
    const bufPhotos = req.gsPhotos;
    const b64Photos = []
    const output = []

    convLoop(req.gsPhotos)
    .then(() => {
        req.b64Photos = b64Photos;
        convLoop(req.resizeByPixel)
        .then(() => {
            // req.
        })
        next();
    })

    function convLoop(photoset) {
        return new Promise((resolve, reject) => {
            for (let n = 0; n < photoset.length; ++n) {
                b64Conv(photoset[n])
                .then(() => {
                    if (n == photoset.length - 1) {
                        resolve();
                    }
                })
            }
        })
    }

    function b64Conv(photo) {
        return new Promise((resolve, reject) => {
            var b64Photo = photo.toString('base64');
            b64Photos.push(b64Photo)
            resolve();
        })
    }
}

module.exports = base64Conversion