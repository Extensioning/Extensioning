export default class Firefox {
    constructor() {

    }

    onManifest(config) {
        let manifest = {
            manifest_version: 2,
            permissions: [
                '*://*/*'
            ],
            browser_specific_settings: {
                gecko: {
                    /*
                        /^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/i
                        /^[a-z0-9-._]*@[a-z0-9-._]+$/i
                    */
                    id: 'TODO-RANDOM-ID',
                    strict_min_version: '42.0'
                }
            },
            web_accessible_resources: [
                'Library/Extension.js'
            ],
        };

        if (typeof (config.author) !== 'undefined') {
            if (typeof (config.author.email) !== 'undefined') {
                manifest.browser_specific_settings.gecko.id = config.author.email;
            }
        }

        if (typeof (config.name) !== 'undefined') {
            manifest.name = config.name;
        }

        if (typeof (config.description) !== 'undefined') {
            manifest.description = config.description;
        }

        if (typeof (config.version) !== 'undefined') {
            manifest.version = config.version;
        }

        if (typeof (config.icons) !== 'undefined') {
            if (typeof (manifest.icons) === 'undefined') {
                manifest.icons = {};
            }

            Object.keys(config.icons).forEach((type) => {
                manifest.icons[type] = config.icons[type];
            });
        }

        if (typeof (config.process) !== 'undefined') {
            manifest.background = {
                persistent: true,
                scripts: [
                    config.proccess.file
                ]
            };

            if (typeof (config.process.type) !== 'undefined' && config.process.type === 'module') {
                manifest.background.type = 'module';
            }
        }

        if (typeof (config.permissions) !== 'undefined') {
            let tabs = false;

            config.permissions.forEach((entry) => {
                switch (entry) {
                    case 'Toolbar':
                        manifest.browser_action = {};
                        tabs = true;
                        break;
                    case 'Addressbar':
                        manifest.page_action = {};
                        tabs = true;
                        break;
                }
            });

            if (tabs) {
                manifest.permissions.push('activeTab');
                manifest.permissions.push('tabs');
            }
        }

        return manifest;
    }

    onBuild() {
        //
    }
}