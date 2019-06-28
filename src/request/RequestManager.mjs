import TwitterApi from 'twitter';
import TwitterConfig from '../config/TwitterConfig';
import ClientMySql from '../request/ClientMySql.mjs';
import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult';

export default class RequestManager{

    constructor(){
        this._mysqlClient = new ClientMySql();
        this._twitterApi = new TwitterApi(TwitterConfig.config);
        this._stackQuery = new Array();

        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results, request, result) => this.resultRequestHandler(results, request, result));
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_ERROR, (error, result) => this.requestErrorHandler(error, result));
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_CREATE_ACCOUNT_HANDLER, (results, request, result) => this.createAccountHandler(results, request, result));
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_LOGIN_HANDLER, (results, request, result) => this.loginHandler(results, request, result));

        this.buildEvent();
    }

    buildEvent(){
        this.eventRequest = new EventsRequest();
    }

    launchMySqlClientQuery(sqlQuery, pParams, pEvent, pRequest, pResult, specialRequest = ''){
        if(this._mysqlClient.isRunning){
            this._stackQuery.push({query:sqlQuery, params:pParams, event:pEvent, request:pRequest, result:pResult, special:specialRequest});
        }else{
            this._mysqlClient.executeQueryRequest(sqlQuery, pParams, pEvent, pRequest, pResult, specialRequest);
        }
    }

    getUserProfile(getParams, result){
        let params = {user_id:getParams['id_profile']};
        this._twitterApi.get('users/show', params, (error, profile, response) => this.apiTwitterHandler(error, profile, response, result));
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
        this._twitterApi.get('statuses/show', params, (error, tweet, response) => this.apiTwitterHandler(error, tweet, response, result));
    }

    getTwitteMessages(getParams, result){
        let sqlQuery = 'SELECT messages.id, messages.text, messages.date, messages.id_tweet, messages.id_user, users.pseudo FROM messages LEFT JOIN users ON messages.id_user = users.id WHERE messages.id_tweet = ? AND messages.isValid = 1 ORDER BY messages.id DESC';
        let params = [getParams['id_twitte']];
        let event = EventsRequest.REQUEST_HANDLER;
        this.launchMySqlClientQuery(sqlQuery, params, event, null, result);
    }

    createUser(request, result){
        let sqlQuery = 'INSERT INTO users (login, password, pseudo, cgu) VALUES (?, ?, ?, ?)';
        let params = [request.body.login.toLowerCase(), request.body.password, request.body.pseudo, 1];
        let event = EventsRequest.REQUEST_CREATE_ACCOUNT_HANDLER;
        let dataResult  = new DataServerResult();
        if(request.body.cgu){
            if(request.body.password == request.body.passwordConfirm && request.body.password != ''){
                let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(regex.test(request.body.login)){
                    if(request.body.pseudo != ''){
                        this.launchMySqlClientQuery(sqlQuery, params, event, request, result, 'addUser');
                    }else{
                        dataResult.jsonResult = {error:1};
                    }
                }else{
                    dataResult.jsonResult = {error:2};
                }
            }else{
                dataResult.jsonResult = {error:3};
            }
        }else{
            dataResult.jsonResult = {error:4};
        }
        
        if(dataResult.jsonResult){
            dataResult.code = 412;
            this.sendHerror(dataResult, result);
        }
    }

    sendLogTo(request, result){
        let sqlQuery = 'SELECT * FROM users WHERE login = ? AND password = ? AND cgu = ? AND isValide = ?';
        let params = [request.body.login.toLowerCase(), request.body.password, 1, 1];
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
            this.launchMySqlClientQuery(oQuery.query, oQuery.params, oQuery.event, oQuery.request, oQuery.result, oQuery.special);
        }else{
            this._mysqlClient.closeClient();
        }
    }

    sendHerror(dataResult, result){
        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult, result);

        this.sendNextQuery();
    }

    createAccountHandler(results, request, result){
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        dataResult.jsonResult = results;
        this.eventRequest.emit(EventsRequest.REQUEST_LOGIN_HANDLER, dataResult, request, result);

        this.sendNextQuery();
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

    apiTwitterHandler(error, returnApi, response, result){
        let dataResult  = new DataServerResult();
        if(!error){
            dataResult.code = 200;
            dataResult.jsonResult = returnApi;
        }else{
            //dataResult.code = 503;
            dataResult.code = 400;
            dataResult.jsonResult = error;
        }

        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult, result);
    }

    requestErrorHandler(error, result){
        let dataResult  = new DataServerResult();
        dataResult.code = error.code ? 400 : 503;
        dataResult.jsonResult = error;
        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult, result);

        this.sendNextQuery();
    }

}