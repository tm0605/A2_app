const sharp = require('sharp');
const fs = require('fs');

const MAX = 2;

(async function () {
  try {
    let start = Date.now();
    for (let i = 0; i <= MAX; i++) {
        const info = await sharp("images/test.png").greyscale().jpeg().toFile("images/edited-test.jpeg");
        console.log(info)
    }
    
    let timing = Date.now() - start;
    //console.log(info)
    console.log(timing + "ms")
  } catch (error) {
    console.log(error);
  }
})();