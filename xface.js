// All cordova js API moved to xface-lib . This is a temporary shim for
// dowstream packages that use xface-cli for the API.

var xface_lib = require('xface-lib');
module.exports = xface_lib.xface;