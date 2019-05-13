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
    }

    initServer(){
        this._storeSession = new StoreSession();
        this._express = express();
        this._express.use(bodyParser.json());
        this._express.use(cookieParser());
        let cookieObject = {expires: 86400000};
        this._express.use(session({secret:'forum', saveUninitialized:true, resave:true, cookie:cookieObject}));
        this._express.post('/api/login', (req, res) => {this.loginTo(req, res)});
        this._express.post('/api/addUser', (req, res) => {this.addUser(req, res)});
        this._express.get('/api/twittes', (req, res) => {this.getTwittes(req, res)});

        this._express.listen(8080);
    }

    addUser(req, res){
        this._result = res;
        this._postRequest.createUser(req.body);
    }

    loginTo(req, res){
        this.storeSession(req);
        this._result = res;
        this._postRequest.sendLogTo(req.body);
    }

    getTwittes(req, res){
        this._result = res;
        this._getRequest.getAllTwittes();
    }

    sendServerReturn(data){
        this._result.setHeader('Content-Type', 'application/json');
        this._result.status(data.code);
        this._result.send(data.jsonResult);
    }

    storeSession(req){
        req.session.cookie.expires = new Date(Date.now() + 86400000);
        //req.session.cookie.expires = new Date(Date.now() + 30000);
        this._storeSession.addSession(req.session);
    }

}