import express from 'express';
import bodyParser from 'body-parser';
import TwitterApi from 'twitter';
import GetRequest from '../request/GetRequest';
import PostRequest from '../request/PostRequest';
import EventsRequest from '../customEvents/EventsRequest';
import TwitterConfig from '../config/TwitterConfig';

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
        this._express = express();
        this._express.use(bodyParser.json());
        this._express.post('/api/login', (req, res) => {this.loginTo(req, res)});
        this._express.get('/api/twittes', (req, res) => {this.getTwittes(req, res)});

        this._express.listen(8080);
    }

    loginTo(req, res){
        this._result = res;
        this._postRequest.sendLogTo(req.body.login, req.body.password);
    }

    getTwittes(req, res){
        this._result = res;
        this._getRequest.getAllTwittes();
    }

    sendServerReturn(data){
        this._result.setHeader('Content-Type', 'text/plain');
        this._result.send(data.jsonResult);
    }

}