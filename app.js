var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
const sharp = require('sharp');

const fileExists = require('./middleware/fileExists');
const { type } = require('os');
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var uploadRouter = require('./routes/upload');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get('/resize', function(req, res) {
  res.sendFile(__dirname + '/views/resize.html')
})

/* app.get('/resizesingle', function(req, res) {
  res.sendFile(__dirname + '/views/resizeSingle.html')
}) */

// app.use('/upload', uploadRouter);
app.post('/upload', 
  fileUpload({ createParentPath: true }),
  fileExists,
  (req, res) => {
    // let start = Date.now();
    var files = req.files.photos
    if (!(files instanceof Array)) { // If single photo add it in an array
      files = [files];
    }

    Object.keys(files).forEach(async key => { // For each photo object in files array
      // console.log(files[key].data)
      // photos[key] = files[key]
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
        .toBuffer()
        .then(data => {
          console.log(data)
          // 100 px wide, auto scale hight
        })
      // console.log(info)
      // console.log(scaleHalf)
      // console.log(scale)
    })
    // let timing = Date.now() - start;

    // console.log(photos)

    return res.json({ status: 'logged', message: files })
  }
)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
