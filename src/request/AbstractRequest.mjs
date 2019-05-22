import ClientMySql from './ClientMySql.mjs';
import DataServerResult from '../entities/DataServerResult';
import EventsRequest from '../customEvents/EventsRequest';

export default class AbstractRequest{

    constructor(twitterApi){
        this._twitterApi = twitterApi;

        this.buildEvent();
    }

    buildEvent(){
        this.eventRequest = new EventsRequest();
    }

    buildClientMySql(){
        this._mysqlClient = new ClientMySql();
        this.addErrorListener();
    }

    addErrorListener(){
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_ERROR, (error) => this.requestErrorHandler(error));
    }

    destroyClientMySql(){
        this._mysqlClient.sqlEvent.removeAllListeners(EventsRequest.REQUEST_HANDLER);
    }

    requestErrorHandler(error){
        this.destroyClientMySql();
        let dataResult  = new DataServerResult();
        dataResult.code = 503;
        dataResult.jsonResult = error;
        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

    resultRequestHandler(results){
        this.destroyClientMySql();
        let dataResult  = new DataServerResult();
        dataResult.code = 200;
        dataResult.jsonResult = results;
        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult);
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

        this.eventRequest.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

}