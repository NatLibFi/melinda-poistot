const path = require('path');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// App files location
const PATHS = {
  app: path.resolve(__dirname, '../frontend/js'),
  shared: path.resolve(__dirname, '../shared/shared'),
  commons_frontend: path.resolve(__dirname, '../melinda-ui-commons/frontend'),
  commons_styles: path.resolve(__dirname, '../melinda-ui-commons/frontend/styles'),
  styles: path.resolve(__dirname, '../frontend/styles'),
  images: path.resolve(__dirname, '../frontend/images'),
  build: path.resolve(__dirname, '../build/public')
};

const plugins = [
  new CopyWebpackPlugin([
    {
      from: PATHS.images,
      to: 'images'
    }
  ]),
  // Shared code
  new webpack.optimize.CommonsChunkPlugin({ name:'vendor', filename: 'js/vendor.bundle.js' }),
  // Avoid publishing files when compilation fails
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  // This plugin moves all the CSS into a separate stylesheet
  new ExtractTextPlugin('css/app.css', { allChunks: true })
];

const sassLoaders = [
  'style-loader',
  'css-loader?sourceMap',
  'postcss-loader',
  'sass-loader?outputStyle=compressed'
];

module.exports = {
  entry: {
    app: path.resolve(PATHS.app, 'main.js'),
    vendor: ['react']
  },
  output: {
    path: PATHS.build,
    filename: 'js/[name].js',
    publicPath: '/'
  },
  stats: {
    colors: true
  },
  resolve: {
    alias: {
      commons: path.resolve(PATHS.commons_frontend, 'js'),
      styles: PATHS.commons_styles,
      shared: PATHS.shared
    },
    // We can now require('file') instead of require('file.jsx')
    extensions: ['.js', '.jsx', '.scss']
  },
  module: {
    noParse: /\.min\.js$/,
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        include: [PATHS.app, PATHS.shared, PATHS.commons_frontend]
      },
      {
        test: /\.scss$/,
        loader: sassLoaders.join('!')
      },
      {
        test: /\.css$/,
        include: [PATHS.styles, PATHS.commons_styles],
        loader: 'style-loader!css-loader!postcss-loader'
      },
      // Inline base64 URLs for <=8k images, direct URLs for the rest
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url-loader?limit=8192&name=images/[name].[ext]?[hash]'
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: 'url-loader?limit=8192&name=fonts/[name].[ext]?[hash]'
      }
    ]
  },
  plugins: plugins,
  devtool: 'source-map'
};
