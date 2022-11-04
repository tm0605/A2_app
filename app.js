var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fileUpload = require("express-fileupload");

const fileExists = require("./middleware/fileExists");
const photoEdit = require("./middleware/photoEdit");
const base64Conversion = require("./middleware/base64Conversion");
const checkRedis = require("./middleware/checkRedis");
const { type } = require("os");
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var uploadRouter = require('./routes/upload');

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.get("/resize", function (req, res) {
  res.sendFile(__dirname + "/views/resize.html");
});

/* app.get('/resizesingle', function(req, res) {
  res.sendFile(__dirname + '/views/resizeSingle.html')
}) */

// app.use('/upload', uploadRouter);
app.post(
  "/upload",
  fileUpload({ createParentPath: true }),
  fileExists,
  checkRedis,
  photoEdit,
  base64Conversion,
  (req, res) => {
    // console.log(req.photos);
    return res.json({ status: "logged", message: req.b64Photos });
  }
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
