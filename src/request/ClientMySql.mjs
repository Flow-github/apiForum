import MySql from 'mysql';
import EventsRequest from '../customEvents/EventsRequest';
import DataBaseConfig from '../config/DataBaseConfig';

export default class ClientMySql{

    constructor(){
        this.sqlEvent = new EventsRequest();
    }

    createClient(){
        this._mysqlClient = MySql.createConnection(DataBaseConfig.config);
    }

    closeClient(){
        this._mysqlClient.destroy();
        this._mysqlClient = null;
    }

    executeQueryRequest(sqlQuery, params, event, request, result){
        this.createClient();
        this._mysqlClient.query(sqlQuery, params, (error, results, fields) => this.requestHandler(error, results, fields, event, request, result));
    }

    requestHandler(error, results, fields, event, request, result){
        this.closeClient();

        if(!error){
            this.sqlEvent.emit(event, results, request, result);
        }else{
            this.sqlEvent.emit(EventsRequest.REQUEST_ERROR, error, result);
        }
    }

}