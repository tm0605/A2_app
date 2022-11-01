const sharp = require('sharp');

const photoEdit = (req, res, next) => {
    var files = req.files.photos
    // console.log(files)
    if (!(files instanceof Array)) { // If single photo add it in an array
        files = [files];
    }

    const photos = [];

    Object.keys(files).forEach(async key => { // For each photo object in files array
        // console.log(files[key].data)
        const name = files[key].name
        const info = await sharp(files[key].data)
        .greyscale()
        .jpeg()
        .toFile(`images/test${key}.jpeg`);
        const scaleHalf = await sharp(files[key].data)
        .metadata()
        .then(({ width }) => sharp(files[key].data)
            .resize(Math.round(width * 0.5))
            // .toBuffer()
            .toFile(`images/testscalehalf${key}.jpeg`)
            /* .then(function(outputBuffer) {
            // outputBuffer contains image data
            }) */);
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
        })
        // console.log(info)
        // console.log(scaleHalf)
        // console.log(scale)
    })
    // let timing = Date.now() - start;
}

module.exports = photoEdit