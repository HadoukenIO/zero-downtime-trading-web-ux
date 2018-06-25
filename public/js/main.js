const envManifest = window.location.origin === 'http://localhost:8080' ? 'local' : 'app';

let serviceProvider;

const thisWindow = fin.desktop.Window.getCurrent();

thisWindow.addEventListener('close-requested', () => {
    const redHatDemoServiceApp = fin.desktop.Application.wrap('RedHatDemoService');
    redHatDemoServiceApp.close();
    fin.desktop.Application.getCurrent().close(true);
})

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
            autoShow: false
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
                    const prodWindow = new fin.desktop.Window({
                        name: 'new-prod', 
                        url: 'new-prod.html',
                        frame: false
                    }, () => {
                        const thisWindow = fin.desktop.Window.getCurrent();
                        thisWindow.getBounds(bounds => {
                            console.log(`Bounds: ${JSON.stringify(bounds)}`);
                            prodWindow.resizeTo(bounds.width, 35, 'top-left', () => { 
                                prodWindow.showAt(bounds.left, bounds.bottom, 'false', () => {
                                    console.log('joining group!')
                                    thisWindow.joinGroup(prodWindow);
                                }) 
                            })
                            // thisWindow.joinGroup(prodWindow, () => {
                            //     prodWindow.resizeTo(bounds.width, 35, 'top-left', () => prodWindow.showAt(bounds.left, bounds.bottom))
                            // });
                        })
                    }, (e) => {
                        console.log(`Error creating window: ${e}`);
                    });
                    // window.location.href = manifest.buildInfo.prodUrl;
                } else if (newlyBuiltAppName === manifest.buildInfo.uat) {
                    console.log('New UAT Build of this Application is Available!');
                    const uatWindow = new fin.desktop.Window({
                        name: 'new-uat', 
                        url: 'new-uat.html',
                        frame: false
                    }, () => {
                        const thisWindow = fin.desktop.Window.getCurrent();
                        thisWindow.getBounds(bounds => {
                            console.log(`Bounds: ${JSON.stringify(bounds)}`);
                            uatWindow.resizeTo(bounds.width, 35, 'top-left', () => {
                                uatWindow.showAt(bounds.left, bounds.bottom, 'false', () => {
                                    thisWindow.joinGroup(uatWindow);
                                })
                            })
                            // thisWindow.joinGroup(uatWindow, () => {
                            //     uatWindow.resizeTo(bounds.width, 35, 'top-left', () => uatWindow.showAt(bounds.left, bounds.bottom))
                            // });
                        })
                    }, (e) => {
                        console.log(`Error creating window: ${e}`);
                    });
                }
            })
        })
    } catch (e) {
        console.log(`Connection error: ${e}`)
    }
        
    console.log(serviceProvider)
}

connectToService();

function launchBuild(target) {
    const thisApp = fin.desktop.Application.getCurrent();
    thisApp.getManifest(m => {
        window.location.href = m.buildInfo[target];
    })
}