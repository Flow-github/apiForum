import EventsRequest from '../customEvents/EventsRequest';
import AbstractRequest from './AbstractRequest.mjs';

export default class GetRequest extends AbstractRequest{

    constructor(twitterApi){
        super(twitterApi);
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
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_HANDLER, (results) => this.resultRequestHandler(results));
        let sqlQuery = 'SELECT messages.id, messages.text, messages.date, messages.id_tweet, messages.id_user, users.pseudo FROM messages LEFT JOIN users ON messages.id_user = users.id WHERE messages.id_tweet = ? AND messages.isValid = 1 ORDER BY messages.id DESC';
        this._mysqlClient.executeQueryRequest(sqlQuery, [getParams['id_twitte']]);
    }

}