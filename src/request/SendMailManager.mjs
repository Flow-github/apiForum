import fs from 'fs';
import EventsRequest from '../customEvents/EventsRequest';
import DataServerResult from '../entities/DataServerResult'

export default class SendMailManager{

    constructor(){
        this.eventRequest = new EventsRequest();
    }

    sendMail(pParams, result){
        let url = './mail/messages.txt';
        fs.open(url, 'a', (err, fd) => {this.openMessageHandler(err, fd, pParams, result)});
    }

    openMessageHandler(pErr, fd, pParams, result){
        if(!pErr){
            let today = new Date();
            let day = today.getDate();
            let month = today.getMonth() + 1;
            let year = today.getFullYear();
            let date = day + '/' + month + '/' + year;
            let texte = 'date : ' + date + "\n";
            texte += 'nom : ' + pParams.name + "\n";
            texte += 'prénom : ' + pParams.firstName + "\n";
            texte += 'mail : ' + pParams.mail + "\n";
            texte += 'message : ' + pParams.message + "\n";
            texte += "-------------- \n";
            fs.appendFile(fd, texte, 'utf8', (err) => {this.writeMessageHandler(err, fd, result)});
        }else{
            let dataResult  = new DataServerResult();
            dataResult.code = 423;
            dataResult.jsonResult = {error:1, message:pErr};
            this.eventRequest.emit(EventsRequest.SEND_MAIL_HANDLER, dataResult, result);
        }
    }

    writeMessageHandler(pErr, fd, result){
        let dataResult  = new DataServerResult();
        if(pErr){
            dataResult.code = 415;
            dataResult.jsonResult = {error:2, message:pErr};
        }

        fs.close(fd, (err) => {this.closeMessageHandler(err, dataResult, result)});
    }

    closeMessageHandler(err, dataResult, result){
        if(err){
            if(dataResult.jsonResult){
                dataResult.code = 415;
                dataResult.jsonResult.error = 3;
                dataResult.jsonResult.messageSup = err;
            }
        }else{
            if(!dataResult.jsonResult){
                dataResult.code = 200;
                dataResult.jsonResult = {return:true};
            }
        }

        this.eventRequest.emit(EventsRequest.SEND_MAIL_HANDLER, dataResult, result);
    }

}