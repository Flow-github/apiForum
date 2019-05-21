import ClientMySql from './ClientMySql.mjs';
import DataServerResult from '../entities/DataServerResult';
import EventsRequest from '../customEvents/EventsRequest';

export default class AbstractRequest{

    constructor(){

    }

    buildClientMySql(){
        this._mysqlClient = new ClientMySql();
        this.addErrorListener();
    }

    addErrorListener(){
        this._mysqlClient.sqlEvent.on(EventsRequest.REQUEST_ERROR, (error) => this.requestErrorHandler(error));
    }

    requestErrorHandler(error){
        this.destroyClientMySql();
        let dataResult  = new DataServerResult();
        dataResult.code = 503;
        dataResult.jsonResult = error;
        this.postRequestEvents.emit(EventsRequest.REQUEST_HANDLER, dataResult);
    }

    destroyClientMySql(){
        this._mysqlClient.sqlEvent.removeAllListeners(EventsRequest.REQUEST_HANDLER);
    }

}