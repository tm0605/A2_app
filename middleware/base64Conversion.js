const base64Conversion = (req, res, next) => {
    const bufPhotos = req.gsPhotos;
    const b64Photos = []
    const output = []

    // convLoop(req.gsPhotos) // Convert all photos
    // .then(() => {
    //     convLoop(req.sharpen)
    //     .then(() => {
    //         convLoop(req.blur)
    //         .then(() => {
    //             convLoop(req.resizeHalf)
    //             .then(() => {
    //                 req.b64Photos = b64Photos;
    //                 next();
    //             })
    //         })
    //     })
    // })
    
    b64Conv(req.gsPhotos[0]) // Convert only first photo
    .then(() => {
        b64Conv(req.sharpen[0])
        .then(() => {
            b64Conv(req.blur[0])
            .then(() => {
                b64Conv(req.resizeHalf[0])
                .then(() => {
                    req.b64Photos = b64Photos; // Assign to req.b64Photos
                    next();
                })
            })
        })
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