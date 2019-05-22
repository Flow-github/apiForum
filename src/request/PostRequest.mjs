import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult';
import AbstractRequest from './AbstractRequest.mjs';

export default class PostRequest extends AbstractRequest{

    constructor(twitterApi){
        super(twitterApi);
    }

    createUser(params){
        this.buildClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.resultRequestHandler(results));
        let sqlQuery = 'INSERT INTO users (login, password) VALUES (?, ?)';
        this._mysqlClient.executeQueryRequest(sqlQuery, [params.login, params.password]);
    }

    sendLogTo(params){
        this.buildClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.loginHandler(results));
        let sqlQuery = 'SELECT * FROM users WHERE login = ? AND password = ?';
        this._mysqlClient.executeQueryRequest(sqlQuery, [params.login, params.password]);
    }

    addMessage(params){
        this.buildClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.resultRequestHandler(results));
        let sqlQuery = 'INSERT INTO messages (text, id_tweet, id_user) VALUES (?, ?, ?)';
        this._mysqlClient.executeQueryRequest(sqlQuery, [params.text, params.id_tweet, params.id_user]);
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
        
        this.eventRequest.emit(EventsRequest.REQUEST_LOGIN_HANDLER, dataResult);
    }

}