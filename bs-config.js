// bs-config.js
"use strict";

var msg = "Hello, world!!" 

// Export configuration options
module.exports = {
  "server": {
    "baseDir": [
      "./src",
      "./build/contracts"
    ],
    "routes": {
      "/vendor": "./node_modules"
    }
  }
}