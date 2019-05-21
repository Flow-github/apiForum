import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import TwitterApi from 'twitter';
import GetRequest from '../request/GetRequest';
import PostRequest from '../request/PostRequest';
import EventsRequest from '../customEvents/EventsRequest';
import TwitterConfig from '../config/TwitterConfig';
import StoreSession from '../session/StoreSession';

export default class ServerController{

    constructor(){
        this.initRequest();
        this.initServer();
    }

    initRequest(){
        let twitterApi = new TwitterApi(TwitterConfig.config);
        this._getRequest = new GetRequest(twitterApi);
        this._postRequest = new PostRequest(twitterApi);

        this._getRequest.getRequestEvents.on(EventsRequest.REQUEST_HANDLER, (data) => {this.sendServerReturn(data)});
        this._postRequest.postRequestEvents.on(EventsRequest.REQUEST_HANDLER, (data) => {this.sendServerReturn(data)});
        this._postRequest.postRequestEvents.on(EventsRequest.REQUEST_LOGIN_HANDLER, (data) => {this.loginServerReturn(data)});
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
        this._express.get('/api/twittes', (req, res) => {this.getTwittes(req, res)});
        this._express.get('/api/twittes/:id_twitte', (req, res) => {this.getTwittes(req, res)});
        this._express.get('/api/twitte/:id_twitte', (req, res) => {this.getTwitte(req, res)});
        this._express.get('/api/twitte/messages/:id_twitte', (req, res) => {this.getTwitteMessages(req, res)});

        this._express.listen(8080);
    }

    addUser(req, res){
        this._result = res;
        this._postRequest.createUser(req.body);
    }

    loginTo(req, res){
        this._request = req;
        this._result = res;
        this._postRequest.sendLogTo(req.body);
    }

    logOutTo(req, res){
        this._result = res;
        this.removeSession(req);
        let dataResult = {code:200, jsonResult:{return:true}};
        this.sendServerReturn(dataResult);
    }

    addMessage(req, res){
        this._result = res;
        this._postRequest.addMessage(req.body);
    }

    getTwittes(req, res){
        this._result = res;
        this._getRequest.getAllTwittes(req.params);
    }

    getTwitte(req, res){
        this._result = res;
        this._getRequest.getTwitte(req.params);
    }

    getTwitteMessages(req, res){
        this._result = res;
        this._getRequest.getTwitteMessages(req.params);
    }

    storeSession(req){
        req.session.cookie.expires = new Date(Date.now() + 86400000);
        this._storeSession.addSession(req.session);
    }

    removeSession(req){
        this._storeSession.removeSession(req.session);
    }

    loginServerReturn(data){
        if(data.code == 200){
            this.storeSession(this._request);
            this._request = null;
        }

        this.sendServerReturn(data);
    }

    sendServerReturn(data){
        this._result.setHeader('Content-Type', 'application/json');
        this._result.status(data.code);
        this._result.send(data.jsonResult);
    }

}