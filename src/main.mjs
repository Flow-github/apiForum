import ApiRestFull from './api/ApiRestFull';
import http from 'http';

function onServerCreate(req, res){
    let api = new ApiRestFull(req, res);
}

let server = http.createServer(onServerCreate);
server.listen(8080);