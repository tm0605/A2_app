const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');

router.post('/upload', 
  fileUpload({ createParentPath: true }),
  async (req, res) => {
    const files = req.files
    console.log(files)

    res.json({ status: 'logged', message: files })
    res.end();
  }
)
  
  
  
module.exports = router;  