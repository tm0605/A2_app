const redis = require("redis");

// Redis setup
const redisClient = redis.createClient({
  url: "redis://cab432a2image-001.km2jzi.0001.apse2.cache.amazonaws.com:6379",
});
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

  // If single photo add it in an array
  if (!(files instanceof Array)) {
    files = [files];
  }

  const saved = [];

  console.log('checking redis...');
  var found = 0;
  var missing = 0
  scan(processing) // Scan images in redis
  .then(() => {
    req.saved = saved; // Assign results to req
    add(processing) // Set keys to redis
    .then(() => {
      next();
    })
  })

  function scan(processing) {
    return new Promise((resolve, reject) => {
      
      const processes = ['greyscale', 'resize', 'sharpen', 'blur'];
      for (let p = 0; p < processes.length; ++p) { // Loop for the number of processes
        if (processing != 'all' && p == 0) { // If its not all, loop once
          p = processes.length - 1;
          var pn = 1;
        }
        else { // Assign process to processing
          processing = processes[p];
          var pn = processes.length;
        }
        for (let n = 0; n < files.length; ++n) { // Loop for the number of images
          var hash = files[n].md5;
          var redisKey = processing + "_" + hash;
          // console.log("redisKey: ", redisKey);
          redisClient
          .get(redisKey) // Attempt to retrieve from redis
          .then((result) => {
            if (result) { // If found
              console.log(`image ${n}: ${result}`);
              found++;
              saved.push(true); // Append true result
            } else { // If not found
              console.log(`image ${n}: not found`);
              missing++;
              saved.push(false); // Append false result
            }
            if (saved.length == files.length * pn) { // If last image of last process
              console.log('redis check done');
              console.log(`found: ${found} missing: ${missing}`)
              
              resolve();
            }
          })
        }
      }
    })
  }

  function add(processing) {
    return new Promise((resolve, reject) => {
      var x = 0; // counter
      var pn, proc;
      const processes = ['greyscale', 'resize', 'sharpen', 'blur'];
      for (let p = 0; p < processes.length; ++p) { // Loop for the number of processes
        if (processing != 'all' && p == 0) { // If not all process loop once
          p = processes.length - 1;
          pn = 1; // Only one process
        }
        else { // Assign process to processing
          proc = 'all';
          processing = processes[p];
          pn = processes.length; // Four process
        }

        for (let n = 0; n < files.length; ++n) { // Loop for the number of images
          if (processing != 'all' && !saved[n]) { // If the process is not all and not saved
            var hash = files[n].md5;
            var redisKey = processing + "_" + hash;
            console.log(`${redisKey} uploaded to redis`);
            redisClient.setEx( // Set key to redis
              redisKey,
              3600,
              redisKey
            )
            .then(() => {
              if (x == files.length * pn - 1) { // If last image of the last process
                
                resolve(); // End
              }
              x++;
            })
          }
          else if (proc == 'all' && !saved[p * files.length + n]) { // If the process is all and not saved
            var hash = files[n].md5;
            var redisKey = processing + "_" + hash;
            console.log(`${redisKey} uploaded to redis`);
            redisClient.setEx( // Set key to redis
              redisKey,
              3600,
              redisKey
            )
            .then(() => {
              if (x == files.length * pn - 1) { // If last image of the last process
                resolve(); // End
              }
              x++;
            })
          }
          else { // Already saved
            if (x == files.length * pn - 1) { // If last image of the last process
              resolve(); // End
            }
            x++;
          }
        }
      }
    })
  }

};

module.exports = checkRedis;
