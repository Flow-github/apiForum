import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult';

export default class PostRequest{

    constructor(twitterApi){
        this._twitterApi = twitterApi;
        this.buildEvent();
    }

    buildEvent(){
        this.postRequestEvents = new EventsRequest();
    }

    sendLogTo(login, password){
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        dataResult.jsonResult = '{"result":"true"}';
        this.postRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

}