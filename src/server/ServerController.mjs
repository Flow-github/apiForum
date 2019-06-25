import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import EventsRequest from '../customEvents/EventsRequest';
import StoreSession from '../session/StoreSession';
import RequestManager from '../request/RequestManager.mjs';
import MailingManager from '../request/SendMailManager.mjs';
import DataServerResult from '../entities/DataServerResult';

export default class ServerController{

    constructor(){
        this.initRequest();
        this.initServer();
    }

    initRequest(){
        this._managerRequest = new RequestManager 
        this._managerRequest.eventRequest.on(EventsRequest.REQUEST_HANDLER, (data, result) => {this.sendServerReturn(data, result)});
        this._managerRequest.eventRequest.on(EventsRequest.REQUEST_LOGIN_HANDLER, (data, request, result) => {this.loginServerReturn(data, request, result)});

        this._managerMailing = new MailingManager();
        this._managerMailing.eventRequest.on(EventsRequest.SEND_MAIL_HANDLER, (data, result) => {this.sendServerReturn(data, result)});
    }

    initServer(){
        this._storeSession = new StoreSession();
        this._express = express();
        this._express.use(bodyParser.json());
        this._express.use(cookieParser());
        let cookieObject = {expires: 86400000};
        this._express.use(session({secret:'forum', saveUninitialized:true, resave:true, cookie:cookieObject}));
        
        this._express.post('/api/addUser', (req, res) => {this.addUser(req, res)});
        this._express.post('/api/login', (req, res) => {this.loginTo(req, res)});
        this._express.post('/api/logout', (req, res) => {this.logOutTo(req, res)});
        this._express.post('/api/twitte/message', (req, res) => {this.addMessage(req, res)});
        this._express.post('/api/sendMail', (req, res) => {this.sendmail(req, res)});
        this._express.get('/api/twittes', (req, res) => {this.getTwittes(req, res)});
        this._express.get('/api/twittes/:id_twitte', (req, res) => {this.getTwittes(req, res)});
        this._express.get('/api/twitte/:id_twitte', (req, res) => {this.getTwitte(req, res)});
        this._express.get('/api/twitte/messages/:id_twitte', (req, res) => {this.getTwitteMessages(req, res)});

        this._express.listen(8080);
    }

    addUser(req, res){
        this._managerRequest.createUser(req, res);
    }

    loginTo(req, res){
        this._managerRequest.sendLogTo(req, res);
    }

    logOutTo(req, res){
        this.removeSession(req);
        let dataResult = {code:200, jsonResult:{return:true}};
        this.sendServerReturn(dataResult, res);
    }

    addMessage(req, res){
        if(this._storeSession.getSessionById(req.session.id)){
            this._managerRequest.addMessage(req.body, res);
        }else{
            let dataResult  = new DataServerResult();
            dataResult.code = 401;
            dataResult.jsonResult = {return:false, message:'Vous devez être logué pour pouvoir faire cette action'};
            this.sendServerReturn(dataResult, res);
        }
    }

    sendmail(req, res){
        this._managerMailing.sendMail(req.body, res);
    }

    getTwittes(req, res){
        this._managerRequest.getAllTwittes(req.params, res);
    }

    getTwitte(req, res){
        this._managerRequest.getTwitte(req.params, res);
    }

    getTwitteMessages(req, res){
        this._managerRequest.getTwitteMessages(req.params, res);
    }

    storeSession(req){
        req.session.cookie.expires = new Date(Date.now() + 86400000);
        this._storeSession.addSession(req.session);
    }

    removeSession(req){
        this._storeSession.removeSession(req.session);
    }

    loginServerReturn(data, request, result){
        if(data.code == 200){
            this.storeSession(request);
            this._request = null;
        }

        this.sendServerReturn(data, result);
    }

    sendServerReturn(data, result){
        result.setHeader('Content-Type', 'application/json');
        result.status(data.code);
        result.send(data.jsonResult);
    }

}