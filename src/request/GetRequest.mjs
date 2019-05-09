import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult';

export default class GetRequest{

    constructor(){
        this.buildEvent();
    }

    buildEvent(){
        this.getRequestEvents = new EventsRequest();
    }

    getAllTwittes(){

    }

}