export default class Chrome {
    constructor() {

    }

    onManifest(config) {
        let manifest = {
            manifest_version: 3,
            permissions: []
        };

        // manifest.author

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
                service_worker: config.process.file
            };

            if (typeof (config.process.type) !== 'undefined' && config.process.type === 'module') {
                manifest.background.type = 'module';
            }
        }

        if (typeof (config.permissions) !== 'undefined') {
            config.permissions.forEach((entry) => {
                if (entry === 'Toolbar') {
                    manifest.action = {};
                    manifest.permissions.push('activeTab');
                    manifest.permissions.push('tabs');
                }
            });
        }

        return manifest;
    }

    onBuild() {

    }
}