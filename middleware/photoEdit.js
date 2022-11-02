const sharp = require('sharp');

const photoEdit = (req, res, next) => {
    var files = req.files.photos
    // console.log(files)
    if (!(files instanceof Array)) { // If single photo add it in an array
        files = [files];
    }

    const photos = [];

    greyscale(files)
    .then(() => {
        // console.log(`greyscale photodata = ${photos}`)
        console.log('assigning greyscale photodata to req.photos');
        req.gsPhotos = photos;
        // console.log(`req.photos = ${req.photos}`)
        next();
    })

    Object.keys(files).forEach(async key => { // For each photo object in files array
        // console.log(files[key].data)
        const name = files[key].name
        /* const tasks = [];
        tasks.push(sharp(files[key].data)
        .greyscale()
        .jpeg()
        .toBuffer()
        .then(data => {
            photos.push(data)
        }))

        tasks.push(sharp(files[key].data)
        .metadata()
        .then(({ width }) => {
            sharp(files[key].data)
            .resize(Math.round(width * 0.5))
            .toBuffer()
            // .toFile(`images/testscalehalf${key}.jpeg`)
            .then(data => {
                photos.push(data)
            })
        }))

        tasks.push(sharp(files[key].data)
        .resize({ width: 100 })
        // 100 px wide, auto scale hight
        .toBuffer()
        .then(data => {
            photos.push(data)
        })) */
        
        /* const info = await sharp(files[key].data)
        .greyscale()
        .jpeg()
        .toFile(`images/test${key}.jpeg`);
        const scaleHalf = await sharp(files[key].data)
        .metadata()
        .then(({ width }) => sharp(files[key].data)
            .resize(Math.round(width * 0.5))
            // .toBuffer()
            .toFile(`images/testscalehalf${key}.jpeg`)
            );
        const scale = await sharp(files[key].data)
        .resize({ width: 100 })
        // 100 px wide, auto scale hight
        .toBuffer()
        .then(data => {
            // const photo = data.toString("base64");
            photos.push(data)
            // console.log(photos)
            req.photos = photos;
            next();
        }) */
        // console.log(info)
        // console.log(scaleHalf)
        // console.log(scale)
        // return Promise.all(tasks);
    })
    // let timing = Date.now() - start;

    function greyscale(photoset) {
        return new Promise((resolve, reject) => {
            console.log('starting photo processing')
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
}



module.exports = photoEdit