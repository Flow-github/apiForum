import EventEmitter from 'events';

export default class EventsRequest extends EventEmitter{

    static get REQUEST_HANDLER(){
        return 'requestHandler';
    }

    static get REQUEST_ERROR(){
        return 'requestError';
    }

}