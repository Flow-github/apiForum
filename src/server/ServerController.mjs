export default class ServerController{

    constructor(res){
        this._result = res;
    }

    sendServerReturn(){
        this._result.writeHead(200, {'Content-Type': 'text/html'});
	    this._result.write('coucou du server');
	    this._result.end();
    }

}