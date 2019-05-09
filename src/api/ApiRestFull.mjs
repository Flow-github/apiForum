import ServerController from '../server/ServerController';

export default class ApiRestFull{

    constructor(){
        this.buildServer();
    }

    buildServer(){
        this._serverController = new ServerController();
    }

}

//module.exports = ApiRestFull;