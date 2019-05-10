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
    }

    executeQueryRequest(sqlQuery, params){
        this.createClient();
        this._mysqlClient.query(sqlQuery, params, (error, results, fields) => this.requestHandler(error, results, fields));
    }

    requestHandler(error, results, fields){
        console.log(error);
        console.log('----------');
        console.log(results[0].id);
        console.log('-----------');
        console.log(fields);
        
        if(!error){
            this.sqlEvent.emit(EventsRequest.REQUEST_HANDLER, results);
        }else{
            this.sqlEvent.emit(EventsRequest.REQUEST_ERROR, error);
        }

        this.closeClient();
    }

}