require = require('@std/esm')(module);
require('./src/main.mjs');
//import ApiRestFull from './src/ApiRestFull';

//var express = require('express');
//var http = require('http');
//var api = require('./src/ApiRestFull');
//var fs = require('fs');

/*var app = express();
app.listen(8080, () => {
  console.log('Server started!')
});*/
/*var request;
var result;

function onServerCreate(req, res){
	request = req;
	result = res;
	load();
}

function load(){
	fs.readFile('./fichierTest.txt', onReadeFile);
}

function onReadeFile(err, data){
	if(!err){
		result.writeHead(200, {'Content-Type': 'text/html'});
		result.write(data);
		result.end();
	}
	
	//console.log('Bienvenue dans Node.js !');
}*/

//function onServerCreate(req, res){
	//let apiRestFull = new api(req, res);
	//res.writeHead(200, {'Content-Type': 'text/html'});
	//res.write();
	//res.end();
	//var toto = new ApiRestFull(req, res);
	//console.log('coucou');
//}

//var server = http.createServer(onServerCreate);
//server.listen(8080);