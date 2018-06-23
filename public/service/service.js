/**
 * This service is codeployed with this application for the purposes of demoing. OpenFin services are typically deployed independently
 * and consumable in your application manifest.
 * 
 * For an example of an OpenFin Service being consumed in a manifest please check out
 *      Layouts: https://github.com/HadoukenIO/layouts-service
 *      Notifications: https://github.com/HadoukenIO/notifications-service
 * 
 * This would allow you to skip all of the logic used to launch the service.
 */

const apps = {};

async function main() {
    const service = await fin.desktop.Service.register();

    service.onConnection((id) => {
        console.log(`New Connection From App: ${id.uuid}`);
        subscribeToBuilds(id.uuid);
    });

    service.register('subscribeToUATBuilds', (payload, id) => {
        console.log(`Applicaton ${id.uuid} subscribed to UAT Build Updates`);
    });
}

main().then(() => {
    console.log('Service Registered.');
});

async function subscribeToBuilds(uuid) {
    if (!apps[uuid]) {
        console.log(uuid)
        const appWithPendingBuilds = await fin.desktop.Application.wrap(uuid);
        appWithPendingBuilds.addEventListener('closed', () => removeAppFromRegisteredApps(uuid));
        appWithPendingBuilds.addEventListener('crashed', () => removeAppFromRegisteredApps(uuid));

        appWithPendingBuilds.getManifest(manifest => {
            console.log(manifest)
            apps[uuid] = {
                prod: manifest.buildInfo.prod,
                uat: manifest.buildInfo.uat,
                adminConsole: manifest.buildInfo.adminConsole
            }
            console.log(apps);
            launchTempAppIfNeeded(manifest.buildInfo.adminConsole);
        });
    } else {
        console.log('App already registered.')
    }
}

function removeAppFromRegisteredApps(uuid) {
    apps[uuid] = null;
}

async function launchTempAppIfNeeded(url) {
    /**
     * We're creating a temporary app so we can connect to the websocket. Temp solutions.
     */
    const allApps = await fin.System.getAllApplications();
    const filteredApps = allApps.filter(el => el.uuid === url);
    if (filteredApps.length === 0) {
        const tempApp = await fin.Application.create({
            name: url,
            uuid: url,
            url: url,
            autoShow: true
        })
        await tempApp.run();
        createWebSocketConnection(url);
    } else {
        console.log('Temp app already running.');
    }
}

let websocketConnection;

function createWebSocketConnection(url) {
    const websocketUrl = url.replace('http', 'ws');
    websocketConnection = new WebSocket(`${websocketUrl}oapi/v1/watch/namespaces/my-test/builds?access_token=${demoToken}`)
    console.log(websocketConnection);
    websocketConnection.onmessage = alertNewBuild;
}

function alertNewBuild(message) {
    const messageData = JSON.parse(message.data);
    const appName = messageData.object.metadata.labels.app;
    if (messageData.object.status.phase === "Complete" && messageData.type === "MODIFIED") {
        console.log(`New build complete - ${appName} New Version Available!`)
    }
}