import TwitterApi from 'twitter';
import TwitterConfig from '../config/TwitterConfig';
import ClientMySql from '../request/ClientMySql.mjs';
import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult'

export default class RequestManager{

    constructor(){
        this._mysqlClient = new ClientMySql();
        this._twitterApi = new TwitterApi(TwitterConfig.config);
        this._stackQuery = new Array();

        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results, request, result) => this.resultRequestHandler(results, request, result));
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_ERROR, (error, result) => this.requestErrorHandler(error, result));
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_LOGIN_HANDLER, (results, request, result) => this.loginHandler(results, request, result));

        this.buildEvent();
    }

    buildEvent(){
        this.eventRequest = new EventsRequest();
    }

    launchMySqlClientQuery(sqlQuery, pParams, pEvent, pRequest, pResult){
        if(this._mysqlClient._mysqlClient){
            this._stackQuery.push({query:sqlQuery, params:pParams, event:pEvent, request:pRequest, result:pResult});
        }else{
            this._mysqlClient.executeQueryRequest(sqlQuery, pParams, pEvent, pRequest, pResult);
        }
    }

    getAllTwittes(getParams, result){
        let idTwitteMax = !getParams['id_twitte'] ? '' : getParams['id_twitte'];
        let params = {count:10, exclude_replies:true};
        if(idTwitteMax != ''){
            params.max_id = idTwitteMax;
        }
        this._twitterApi.get('statuses/user_timeline', params, (error, tweets, response) => this.apiTwitterHandler(error, tweets, response, result));
    }

    getTwitte(getParams, result){
        let params = {id:getParams['id_twitte']};
        this._twitterApi.get('statuses/show', params, (error, tweets, response) => this.apiTwitterHandler(error, tweets, response, result));
    }

    getTwitteMessages(getParams, result){
        let sqlQuery = 'SELECT messages.id, messages.text, messages.date, messages.id_tweet, messages.id_user, users.pseudo FROM messages LEFT JOIN users ON messages.id_user = users.id WHERE messages.id_tweet = ? AND messages.isValid = 1 ORDER BY messages.id DESC';
        let params = [getParams['id_twitte']];
        let event = EventsRequest.REQUEST_HANDLER;
        this.launchMySqlClientQuery(sqlQuery, params, event, null, result);
    }

    createUser(pParams, result){
        let sqlQuery = 'INSERT INTO users (login, password) VALUES (?, ?)';
        let params = [pParams.login, pParams.password];
        let event = EventsRequest.REQUEST_HANDLER;
        this.launchMySqlClientQuery(sqlQuery, params, event, null, result);
    }

    sendLogTo(request, result){
        let sqlQuery = 'SELECT * FROM users WHERE login = ? AND password = ?';
        let params = [request.body.login, request.body.password];
        let event = EventsRequest.REQUEST_LOGIN_HANDLER;
        this.launchMySqlClientQuery(sqlQuery, params, event, request, result);
    }

    addMessage(pParams, result){
        let sqlQuery = 'INSERT INTO messages (text, id_tweet, id_user) VALUES (?, ?, ?)';
        let params = [pParams.text, pParams.id_tweet, pParams.id_user];
        let event = EventsRequest.REQUEST_HANDLER;
        this.launchMySqlClientQuery(sqlQuery, params, event, null, result);
    }

    sendNextQuery(){
        if(this._stackQuery.length > 0){
            let oQuery = this._stackQuery[0];
            this._stackQuery.splice(0, 1);
            this.launchMySqlClientQuery(oQuery.query, oQuery.params, oQuery.event, oQuery.request, oQuery.result);
        }
    }

    loginHandler(results, request, result){
        let dataResult  = new DataServerResult();
        if(!results[0]){
            dataResult.code = 404;
            dataResult.jsonResult = {return:false};
        }else{
            dataResult.code = 200;
            dataResult.jsonResult = results[0];
        }
        
        this.eventRequest.emit(EventsRequest.REQUEST_LOGIN_HANDLER, dataResult, request, result);

        this.sendNextQuery();
    }

    resultRequestHandler(results, request, result){
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        dataResult.jsonResult = results;
        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult, result);

        this.sendNextQuery();
    }

    apiTwitterHandler(error, tweets, response, result){
        let dataResult  = new DataServerResult();
        if(!error){
            dataResult.code = 200;
            dataResult.jsonResult = tweets;
        }else{
            dataResult.code = 503;
            dataResult.jsonResult = error;
        }

        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult, result);
    }

    requestErrorHandler(error, result){
        let dataResult  = new DataServerResult();
        dataResult.code = 503;
        dataResult.jsonResult = error;
        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult, result);

        this.sendNextQuery();
    }

}