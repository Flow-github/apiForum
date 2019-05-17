import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult';

export default class GetRequest{

    constructor(twitterApi){
        this._twitterApi = twitterApi;
        this.buildEvent();
    }

    buildEvent(){
        this.getRequestEvents = new EventsRequest();
    }

    getAllTwittes(getParams){
        let idTwitteMax = !getParams['id_twitte'] ? 0 : getParams['id_twitte'];
        let params = {count:3};
        if(idTwitteMax > 0){
            params.max_id = idTwitteMax;
        }
        this._twitterApi.get('statuses/user_timeline', params, (error, tweets, response) => this.apiTwitterHandler(error, tweets, response));
    }

    getTwitte(getParams){
        let params = {id:getParams['id_twitte']};
        this._twitterApi.get('statuses/show', params, (error, tweets, response) => this.apiTwitterHandler(error, tweets, response));
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

}