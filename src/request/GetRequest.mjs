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

    getAllTwittes(){

    }

}