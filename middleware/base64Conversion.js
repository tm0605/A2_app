const base64Conversion = (req, res, next) => {
    const bufPhotos = req.photos;
    const b64Photos = []
    for (var photo of bufPhotos) {
        photo = photo.toString("base64");
        b64Photos.push(photo)
    }
    console.log(b64Photos)
    req.photos = b64Photos;
    next();
}

module.exports = base64Conversion