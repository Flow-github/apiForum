import ServerController from '../server/ServerController';

export default class ApiRestFull{

    constructor(req, res){
        this.buildServer(res);
        this.analyseRequest(req);
    }

    buildServer(res){
        this._serverController = new ServerController(res);
    }

    analyseRequest(req) {
        console.log('analyseRequest');

        this._serverController.sendServerReturn();
    }

}

//module.exports = ApiRestFull;