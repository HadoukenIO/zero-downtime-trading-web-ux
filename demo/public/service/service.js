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
        console.log(id)
        console.log(`New Connection From App: ${id.uuid}`);
        subscribeToBuilds(id);
    });

    service.register('subscribeToUATBuilds', (payload, id) => {
        console.log(`Applicaton ${id.uuid} subscribed to UAT Build Updates`);
    });

    const alertSocketConnection = new WebSocket('ws://openshift-ws-alerts-my-test.129.146.147.219.xip.io/');

    alertSocketConnection.onmessage = (message) => {
        console.log(message);
        const jsonResponse = JSON.parse(message.data);
        console.log(jsonResponse);
        if (apps[jsonResponse.appName]) {
            service.dispatch(apps[jsonResponse.appName], 'new-build', jsonResponse);
        }
    }
}

main().then(() => {
    console.log('Service Registered.');
});

async function subscribeToBuilds(id) {
    const uuid = id.uuid;
    if (!apps[uuid]) {
        const appWithPendingBuilds = await fin.desktop.Application.wrap(uuid);
        // appWithPendingBuilds.addEventListener('closed', () => removeAppFromRegisteredApps(uuid));
        // appWithPendingBuilds.addEventListener('crashed', () => removeAppFromRegisteredApps(uuid));

        appWithPendingBuilds.getManifest(manifest => {
            apps[manifest.buildInfo.prod] = id;
            apps[manifest.buildInfo.uat] = id;
            console.log(apps);
        });
    } else {
        console.log('App already registered.')
    }
}

function removeAppFromRegisteredApps(uuid) {
    console.log('remove');
}
