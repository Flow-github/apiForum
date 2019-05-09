export default class DataServerResult{

    get code(){
        return this._code;
    }

    set code(value){
        this._code = value;
    }

    get jsonResult(){
        return this._jsonResult;
    }

    set jsonResult(value){
        this._jsonResult = value;
    }

    constructor(){
        this._code = null;
        this._jsonResult = null;
    }

}