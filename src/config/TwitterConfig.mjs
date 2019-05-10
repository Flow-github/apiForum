export default class TwitterConfig{

    static get config(){
        let configObject = {
            consumer_key: '',
            consumer_secret: '',
            access_token_key: '',
            access_token_secret: ''
        };

        return configObject;
    }

}