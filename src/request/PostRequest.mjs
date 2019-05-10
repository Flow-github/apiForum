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

    createUser(login, password){
        this._mysqlClient = new ClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.createUserHandler(results));
        let sqlQuery = 'INSERT INTO users (login, password) VALUES (?, ?)';
        this._mysqlClient.executeQueryRequest(sqlQuery, [login, password]);
    }

    sendLogTo(login, password){
        this._mysqlClient = new ClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.loginHandler(results));
        let sqlQuery = 'SELECT * FROM users WHERE login = ? AND password = ?';
        this._mysqlClient.executeQueryRequest(sqlQuery, [login, password]);
    }

    createUserHandler(results){
        this._mysqlClient.sqlEvent.removeAllListeners(EventsRequest.REQUEST_HANDLER);
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        //dataResult.jsonResult = '{"result":"true"}';
        dataResult.jsonResult = '{"result":"' + results + '"}';
        this.postRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

    loginHandler(results){
        this._mysqlClient.sqlEvent.removeAllListeners(EventsRequest.REQUEST_HANDLER);
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        //dataResult.jsonResult = '{"result":"true"}';
        dataResult.jsonResult = '{"result":"' + results + '"}';
        dataResult.jsonResult = results[0];
        this.postRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

}