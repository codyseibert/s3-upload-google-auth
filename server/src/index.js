const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const upload = multer();
const AWS = require("aws-sdk");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const Uploads = require("./models/uploads");
const mongoose = require("mongoose");
const passport = require("passport");
const { config } = require("dotenv");

config();

const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRET],
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  })
);

app.use(passport.initialize());
app.use(passport.session());

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  region: "us-east-1",
  s3ForcePathStyle: true,
});

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173/",
    failureRedirect: "http://localhost:5173/error",
  })
);

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({
      error: "unauthenticated",
    });
  }
}

app.post("/files", isAuthenticated, upload.single("file"), async (req, res) => {
  const file = req.file;

  const upload = new Uploads();
  upload.filename = file.originalname;
  const createdFile = await upload.save();

  await s3
    .putObject({
      Key: file.originalname,
      Bucket: process.env.BUCKET_NAME,
      Body: file.buffer,
    })
    .promise();

  res.json(createdFile);
});

app.get("/files", isAuthenticated, async (req, res) => {
  const files = await Uploads.find();
  res.json(files);
});

app.get("/files/:filename", isAuthenticated, async (req, res) => {
  const data = await s3
    .getObject({
      Key: req.params.filename,
      Bucket: process.env.BUCKET_NAME,
    })
    .promise();
  res.attachment(req.params.filename);
  res.type(data.ContentType);
  res.send(data.Body);
});

mongoose.connect(MONGO_URL).then(() => {
  console.log(`listening on port ${PORT}`);
  app.listen(PORT);
});
