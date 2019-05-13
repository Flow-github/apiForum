export default class StoreSession{

    constructor(){
        this._storeSessions = [];
    }

    addSession(session){
        var canAdd = true;
        for(var i = this._storeSessions.length - 1; i >= 0; i--){
            if(this.testValidityDate(i)){
                continue;
            }else if(this._storeSessions[i].id == session.id){
                canAdd = false;
                break;
            }
        }

        if(canAdd){
            this._storeSessions.push(session);
        }
    }

    removeSession(session){
        for(var i = this._storeSessions.length - 1; i >= 0; i--){
            if(this._storeSessions[i].id == session.id){
                this._storeSessions.splice(i, 1);
                break;
            }

            this.testValidityDate(i);
        }
    }

    getSessionById(sessionId){
        var session;
        for(var i = this._storeSessions.length - 1; i >= 0; i--){
            if(this.testValidityDate(i)){
                continue;
            }else if(this._storeSessions[i].id == sessionId){
                session = this._storeSessions[i];
                break;
            }
        }

        return session;
    }

    testValidityDate(index){
        var nowDate = new Date(Date.now());
        var isNotValide = false;
        if(this._storeSessions[index].cookie.expires < nowDate){
            this._storeSessions.splice(index, 1);
            isNotValide = true;
        }

        return isNotValide;
    }

}