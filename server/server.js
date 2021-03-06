import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import notesRoute from './routes/notes';
import usersRoute from './routes/user';
import xlistRoute from './routes/xlist';
import foldersRoute from './routes/folders';
import accessRoute from './routes/access';

// Configure environment variables for server
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Base url for our api
const baseUrl = '/api/v1';

if (process.env.NODE_ENV === 'production') {
  /*
   * Redirect user to https if requested on http
   *
   * Refer this for explaination:
   * https://www.tonyerwin.com/2014/09/redirecting-http-to-https-with-nodejs.html
   */
  app.enable('trust proxy');
  app.use((req, res, next) => {
    // console.log('secure check');
    if (req.secure) {
      // console.log('secure');
      // request was via https, so do no special handling
      next();
    } else {
      //
      // request was via http, so redirect to https
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  });
}

// Body parser middleware for json and url encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to the database
mongoose.connect(process.env.REACT_APP_MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

app.use(`${baseUrl}/access`, accessRoute);
app.use(`${baseUrl}/notes`, notesRoute);
app.use(`${baseUrl}/users`, usersRoute);
app.use(`${baseUrl}/xlist`, xlistRoute);
app.use(`${baseUrl}/folders`, foldersRoute);

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../client/build/')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

app.listen(port, () => `Listening on port ${port}`);
