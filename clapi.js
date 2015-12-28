var bodyParser = require('body-parser'),
    express = require('express'),
    execSync = require('child_process').execSync

var clapi = express();
clapi.use(bodyParser.json());
clapi.use(bodyParser.urlencoded({extended: false}));

var getKey = function(obj, key, response) {
   if (!obj[key]) {
      response.statusCode = 400;
      response.send(key + " not found.");
      return false;
   } else {
      return obj[key];
   }
};

var getCredentials = function(request, response) {
   var body = getKey(request, "body", response);
   if (!body) return false;

   var username = getKey(body, "username", response);
   if (!username) return false;

   var password = getKey(body, "password", response);
   if (!password) return false;

   return [username, password];
};

var createFTPUser = function(credentials) {
   var command = "echo " + credentials[1] + " >> pwfile";
   command += ";" + command;
   command += ";pure-pw useradd " + credentials[0] + " -u ftpuser -d /home/ftpusers/" + credentials[0] + " -m < ./pwfile";
   command += ";pure-pw mkdb";
   command += ";rm pwfile"

   var output = execSync(command);
};

clapi.post('/ftp', function(request, response) {
   var credentials = getCredentials(request, response);
   if (!credentials) return;

   createFTPUser(credentials);
   response.sendStatus(200);
});

var server = clapi.listen(8080);

console.log("CLAPI is hacking at somewhere...");
