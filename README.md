To run this thing enter the command

  `npm run build-css && nodemon`

in Git Bash

Your nodemon.json file (in root dir) should look like this:
  `{
      "verbose": true,
      "ext": "scss js json",
      "events": {
          "restart": "npm run build-css"
      }
  }`

And you must have the script in your package.json:
   "scripts": {
          "build-css": "node-sass --recursive --output public/css --source-map true --source-map-contents public/sass "
      },

