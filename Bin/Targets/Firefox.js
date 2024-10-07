export default class Firefox {
    constructor() {

    }

    onManifest(config) {
        let json = {
            manifest_version: 2,
            browser_specific_settings: {
                gecko: {
                    /*
                        /^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/i
                        /^[a-z0-9-._]*@[a-z0-9-._]+$/i
                    */
                    id: 'TODO-RANDOM-ID',
                    strict_min_version: '42.0'
                }
            }
        };

        if(typeof(config.author) !== 'undefined') {
            if(typeof(config.author.email) !== 'undefined') {
                json.browser_specific_settings.gecko.id = config.author.email;
            }
        }

        if(typeof(config.name) !== 'undefined') {
            json.name = config.name;
        }

        if(typeof(config.description) !== 'undefined') {
            json.description = config.description;
        }

        if(typeof(config.version) !== 'undefined') {
            json.version = config.version;
        }

        if(typeof(config.icons) !== 'undefined') {
            if(typeof(config.icons['48']) !== 'undefined') {
                json.icons = {
                    '48': config.icons['48']
                };
            }
        }

        if(typeof(config.proccess) !== 'undefined') {
            json.background = {
                persistent: true,
                scripts: [
                    config.proccess.file
                ]
            };

            if(typeof(config.proccess.type) !== 'undefined' && config.proccess.type === 'module') {
                json.background.type = 'module';
            }
        }

        return json;
    }

    onBuild() {
        //
    }
}