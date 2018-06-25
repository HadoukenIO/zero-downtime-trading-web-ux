const envManifest = window.location.origin === 'http://localhost:8080' ? 'local' : 'app';

let serviceProvider;

async function connectToService() {
    /**
     * We'll first check if the service is running and launch it if not. As mentioned in the service javascript logic, this would be handled
     * in the application manifest in production. This would be deployed separately. We'll assume the service is always on prod.
     */
    const allApplications = await fin.System.getAllApplications();
    console.log(allApplications);

    function serviceIsRunning() {
        const serviceApp = allApplications.filter(el => el.uuid === 'RedHatDemoService');
        return serviceApp.length > 0;
    }

    if (!serviceIsRunning()) {
        console.log(`${window.location.origin}/service/${envManifest}.json`);
        const serviceApp = await fin.Application.create({
            name: 'RedHatDemoService',
            uuid: 'RedHatDemoService',
            url: `${window.location.origin}/service/`,
            autoShow: true
        });
        const nowApplications = await fin.System.getAllApplications();
        await serviceApp.run();
        console.log('Service now running.');
    } else {
        console.log('Service was already running.');
    }

    try {
        serviceProvider = await fin.desktop.Service.connect({ uuid: 'RedHatDemoService' });
        serviceProvider.register('new-build', (message) => {
            console.log(`New Build! ${JSON.stringify(message)}`);
            const newlyBuiltAppName = message.appName;
            const thisApp = fin.desktop.Application.getCurrent();
            thisApp.getManifest(manifest => {
                if (newlyBuiltAppName === manifest.buildInfo.prod) {
                    console.log('New Production Build of this Application is Available!');
                    window.location.href = manifest.buildInfo.prodUrl;
                } else if (newlyBuiltAppName === manifest.buildInfo.uat) {
                    console.log('New UAT Build of this Application is Available!');
                    window.location.href = manifest.buildInfo.uatUrl;
                }
            })
        })
    } catch (e) {
        console.log(`Connection error: ${e}`)
    }
        
    console.log(serviceProvider)
}

connectToService();