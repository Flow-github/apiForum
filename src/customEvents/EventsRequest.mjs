import EventEmitter from 'events';

export default class EventsRequest extends EventEmitter{

    static get REQUEST_CREATE_ACCOUNT_HANDLER(){
        return 'requestCreateAccountHandler';
    }

    static get REQUEST_LOGIN_HANDLER(){
        return 'requestLoginHandler';
    }

    static get REQUEST_HANDLER(){
        return 'requestHandler';
    }

    static get REQUEST_ERROR(){
        return 'requestError';
    }

}