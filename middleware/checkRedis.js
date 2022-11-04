const redis = require("redis");

const checkRedis = (req, res, next) => {
    const redisClient = redis.createClient({
        url: 'redis://cab432a2image-001.km2jzi.0001.apse2.cache.amazonaws.com:6379'
    });
    
    redisClient.connect();
    
    redisClient.on('connect', function () {
        console.log('redis connected');
    })
    
    redisClient.on('error', (err) => {
        console.log('Error '+ err);
    })

    
    var files = req.files.photos
    
    if (!(files instanceof Array)) { // If single photo add it in an array
        files = [files];
    }

    const saved = [];
    var key = '';

    for (let n = 0; n < files.length; ++n) {
        redisClient.get(key).then((result) => { //Redisから引っ張ってくる
            if (result) {
                console.log(result);
                saved.push(True);
            }
            else {
                console.log('no result');
                saved.push(False);
            }
        }).then(() => {
            if (n == files.length - 1) {
                req.saved = saved
                next()
            }
        })
    }
}

module.exports = checkRedis