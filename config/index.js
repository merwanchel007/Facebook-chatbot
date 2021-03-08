'use strict';
if (process.env.NODE_ENV === 'production') {
  console.log('env')
  module.exports = {
    FB: {
      pageAccessToken: process.env.pageAccessToken,
      VerifyToken: process.env.VerifyToken,
      appSecret: process.env.appSecret
    },
    TMDB: process.env.TMDB
  }
} else {
  console.log('noenv')
  module.exports = require('./development.json');
}