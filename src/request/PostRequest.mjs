import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult';
import ClientMySql from './ClientMySql.mjs';

export default class PostRequest{

    constructor(twitterApi){
        this._twitterApi = twitterApi;
        this.buildEvent();
    }

    buildEvent(){
        this.postRequestEvents = new EventsRequest();
    }

    buildClientMySql(){
        this._mysqlClient = new ClientMySql();
        this.addErrorListener();
    }

    destroyClientMySql(){
        this._mysqlClient.sqlEvent.removeAllListeners(EventsRequest.REQUEST_HANDLER);
    }

    addErrorListener(){
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_ERROR, (error) => this.requestErrorHandler(error));
    }

    createUser(params){
        this.buildClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.createUserHandler(results));
        let sqlQuery = 'INSERT INTO users (login, password) VALUES (?, ?)';
        this._mysqlClient.executeQueryRequest(sqlQuery, [params.login, params.password]);
    }

    sendLogTo(params){
        this.buildClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.loginHandler(results));
        let sqlQuery = 'SELECT * FROM users WHERE login = ? AND password = ?';
        this._mysqlClient.executeQueryRequest(sqlQuery, [params.login, params.password]);
    }

    createUserHandler(results){
        this.destroyClientMySql();
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        dataResult.jsonResult = results;
        this.postRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

    loginHandler(results){
        this.destroyClientMySql();
        let dataResult  = new DataServerResult();
        if(!results[0]){
            dataResult.code = 404;
            dataResult.jsonResult = {return:false};
        }else{
            dataResult.code = 200;
            dataResult.jsonResult = results[0];
        }
        
        this.postRequestEvents.emit(EventsRequest.REQUEST_LOGIN_HANDLER, dataResult);
    }

    requestErrorHandler(error){
        this.destroyClientMySql();
        let dataResult  = new DataServerResult();
        dataResult.code = 503;
        dataResult.jsonResult = error;
        this.postRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

}