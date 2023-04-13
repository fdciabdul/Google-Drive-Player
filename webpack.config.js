const { resolve } = require('path');

module.exports = {
  resolve: {
    alias: {
      path: 'path-browserify',
    },
    fallback: {
      url: require.resolve('url/'),
    },
  },
};
