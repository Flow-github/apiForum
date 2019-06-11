import MySql from 'mysql';
import EventsRequest from '../customEvents/EventsRequest';
import DataBaseConfig from '../config/DataBaseConfig';

export default class ClientMySql{

    get isRunning(){
        return this._isRunning;
    }

    constructor(){
        this.sqlEvent = new EventsRequest();
    }

    createClient(){
        if(!this._mysqlClient){
            this._mysqlClient = MySql.createConnection(DataBaseConfig.config);
        }
    }

    closeClient(){
        if(this._mysqlClient){
            this._mysqlClient.destroy();
        }
        
        this._mysqlClient = null;
    }

    testDuplicateUser(requestObject){
        let sqlQuery = 'SELECT COUNT(id) AS numLogin FROM users WHERE login = ?';
        let params = [requestObject.params[0]];
        this._mysqlClient.query(sqlQuery, params, (error, results, fields) => this.testLoginHandler(error, results, fields, requestObject));
    }

    testLoginHandler(pError, pResults, pFields, requestObject){
        if(!pError){
            requestObject.numLogin = pResults[0].numLogin;
            let sqlQuery = 'SELECT COUNT(id) AS numPseudo FROM users WHERE pseudo = ?';
            let params = [requestObject.params[2]];
            this._mysqlClient.query(sqlQuery, params, (error, results, fields) => this.testPseudoHandler(error, results, fields, requestObject));
        }else{
            this.sqlEvent.emit(EventsRequest.REQUEST_ERROR, pError, requestObject.result);
        }
    }

    testPseudoHandler(pError, pResults, pFields, requestObject){
        if(!pError){
            requestObject.numPseudo = pResults[0].numPseudo;
            if(requestObject.numLogin == 0 && requestObject.numPseudo == 0){
                this.executeQueryRequest(requestObject.query, requestObject.params, requestObject.event, requestObject.request, requestObject.result);
            }else{
                let codeMessage = requestObject.numLogin > 0 ? 5 : 0;
                codeMessage = (requestObject.numPseudo > 0 ? (codeMessage > 0 ? 7 : 6) : codeMessage);
                this.requestHandler({code:400, error:codeMessage}, pResults, pFields, requestObject);
            }
        }else{
            this.sqlEvent.emit(EventsRequest.REQUEST_ERROR, pError, requestObject.result);
        }
    }

    executeQueryRequest(sqlQuery, pParams, pEvent, pRequest, pResult, specialRequest = ''){
        this.createClient();
        this._isRunning = true;
        let requestObject = {query: sqlQuery, params:pParams, event:pEvent, request: pRequest, result: pResult};
        switch(specialRequest){
            case 'addUser' :
                this.testDuplicateUser(requestObject);
            break;
            default :
            this._mysqlClient.query(sqlQuery, pParams, (error, results, fields) => this.requestHandler(error, results, fields, requestObject));
            break;
        }
    }

    requestHandler(error, results, fields, requestObject){
        this._isRunning = false;
        if(!error){
            this.sqlEvent.emit(requestObject.event, results, requestObject.request, requestObject.result);
        }else{
            this.sqlEvent.emit(EventsRequest.REQUEST_ERROR, error, requestObject.result);
        }
    }

}