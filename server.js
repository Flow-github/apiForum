var express = require('express');
var http = require('http');
var fs = require('fs');

var app =express();
app.listen(8080, () => {
  console.log('Server started!')
});
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
}

var server = http.createServer(onServerCreate);
server.listen(8080);*/