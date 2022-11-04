const redis = require("redis");
const redisClient = redis.createClient(/* {
  url: "redis://cab432a2image-001.km2jzi.0001.apse2.cache.amazonaws.com:6379",
} */);

redisClient.connect();

redisClient.on("connect", function () {
  console.log("redis connected");
});

redisClient.on("error", (err) => {
  console.log("Error " + err);
});

const checkRedis = (req, res, next) => {

  var files = req.files.photos;
  var processing = req.query.processing;
  const processes = ['greyscale', 'resize', 'sharpen', 'blur'];

  if (!(files instanceof Array)) {
    // If single photo add it in an array
    files = [files];
  }

  const saved = [];

  console.log('checking redis...');
  var found = 0;
  var missing = 0
  if (processing == 'all') {
    for (let n = 0; n < processes.length; ++n) {
      processing = processes[n];
      scan()
      .then(() => {
        if (n == processes.length - 1) {
          req.saved = saved;
          next();
        }
      });
    }
  }
  else {
    scan()
    .then(() => {
      req.saved = saved;
      console.log(saved);
      next();
    })
  }

  function scan() {
    return new Promise((resolve, reject) => {
      for (let n = 0; n < files.length; ++n) {
        var hash = files[n].md5;
        var redisKey = processing + "_" + hash;
        console.log("redisKey: ", redisKey);
        redisClient
        .get(redisKey)
        .then((result) => {
          //Redisから引っ張ってくる
          if (result) {
            console.log(`image ${n}: ${result}`);
            found++;
            saved.push(true);
          } else {
            console.log(`image ${n}: no result`);
            missing++;
            saved.push(false);
          }
        })
        .then(() => {
          if (n == files.length - 1) {
            console.log('redis check done');
            console.log(`found: ${found} missing: ${missing}`)
            
            resolve();
          }
        });
      }
    })
    
  }

};

module.exports = checkRedis;
