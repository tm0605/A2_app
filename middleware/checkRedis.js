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

  if (!(files instanceof Array)) {
    // If single photo add it in an array
    files = [files];
  }

  const saved = [];

  console.log('checking redis...');
  var found = 0;
  var missing = 0
  scan(processing, files)
  .then(() => {
    req.saved = saved;
    add(processing, files)
    .then(() => {
      next();
    })
  })

  function scan(processing) {
    return new Promise((resolve, reject) => {
      
      const processes = ['greyscale', 'resize', 'sharpen', 'blur'];
      for (let p = 0; p < processes.length; ++p) {
        if (processing != 'all' && p == 0) {
          p = processes.length - 1;
        }
        else {
          processing = processes[p];
        }
        for (let n = 0; n < files.length; ++n) {
          var hash = files[n].md5;
          var redisKey = processing + "_" + hash;
          // console.log("redisKey: ", redisKey);
          redisClient
          .get(redisKey)
          .then((result) => {
            //Redisから引っ張ってくる
            if (result) {
              console.log(`image ${n}: ${result}`);
              found++;
              saved.push(true);
            } else {
              console.log(`image ${n}: not found`);
              missing++;
              saved.push(false);
            }
          })
          .then(() => {
            if (n == files.length - 1 && p == processes.length - 1) {
              console.log('redis check done');
              console.log(`found: ${found} missing: ${missing}`)
              
              resolve();
            }
          });
        }
        
      }
      
    })
    
  }

  function add(processing) {
    return new Promise((resolve, reject) => {
      
      const processes = ['greyscale', 'resize', 'sharpen', 'blur'];
      for (let p = 0; p < processes.length; ++p) {
        if (processing != 'all' && p == 0) {
          p = processes.length - 1;
        }
        else {
          processing = processes[p];
          // console.log(processing);
        }

        for (let n = 0; n < files.length; ++n) {
          if (processing != 'all' && !saved[n]) {
            var hash = files[n].md5;
            var redisKey = processing + "_" + hash;
            console.log(`${redisKey} uploaded to redis`);
            redisClient.setEx(
              redisKey,
              3600,
              redisKey
            )
            .then(() => {
              if (n == files.length - 1 && p == processes.length - 1) {
                resolve();
              }
            })
          }
          else if (processing == 'all' && !saved[p * files.length + n]) {
            console.log(p * files.length + n)
            var hash = files[n].md5;
            var redisKey = processing + "_" + hash;
            console.log(`${redisKey} uploaded to redis`);
            redisClient.setEx(
              redisKey,
              3600,
              redisKey
            )
            .then(() => {
              if (n == files.length - 1 && p == processes.length - 1) {
                resolve();
              }
            })
          }
          else {
            if (n == files.length - 1 && p == processes.length - 1) {
              resolve();
            }
          }
        }
      }
    })
  }

};

module.exports = checkRedis;
