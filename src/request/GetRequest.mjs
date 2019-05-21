import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult';
import AbstractRequest from './AbstractRequest.mjs';

export default class GetRequest extends AbstractRequest{

    constructor(twitterApi){
        super();

        this._twitterApi = twitterApi;
        this.buildEvent();
    }

    buildEvent(){
        this.getRequestEvents = new EventsRequest();
    }

    getAllTwittes(getParams){
        let idTwitteMax = !getParams['id_twitte'] ? '' : getParams['id_twitte'];
        let params = {count:10, exclude_replies:true};
        if(idTwitteMax != ''){
            params.max_id = idTwitteMax;
        }
        this._twitterApi.get('statuses/user_timeline', params, (error, tweets, response) => this.apiTwitterHandler(error, tweets, response));
    }

    getTwitte(getParams){
        let params = {id:getParams['id_twitte']};
        this._twitterApi.get('statuses/show', params, (error, tweets, response) => this.apiTwitterHandler(error, tweets, response));
    }

    getTwitteMessages(getParams){
        this.buildClientMySql();
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.twitteMessagesHandler(results));
        let sqlQuery = 'SELECT * FROM messages LEFT JOIN users ON messages.id_user = users.id WHERE id_tweet = ? ORDER BY id DESC';
        this._mysqlClient.executeQueryRequest(sqlQuery, [getParams['id_twitte']]);
    }

    apiTwitterHandler(error, tweets, response){
        let dataResult  = new DataServerResult();
        if(!error){
            dataResult.code = 200;
            dataResult.jsonResult = tweets;
        }else{
            dataResult.code = 503;
            dataResult.jsonResult = error;
        }

        this.getRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

    twitteMessagesHandler(){
        this.destroyClientMySql();
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        dataResult.jsonResult = results;
        this.postRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

}