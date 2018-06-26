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

const data = [
    ["Trade Date", "Index Value", "High", "Low", "Total Market Value", "Dividend Market Value"],
    ["2018-06-22", 1102.65, 1107.74, 1101.0, 2457988405.0, 0.0],
    ["2018-06-21", 1104.22, 1115.73, 1103.01, 2461496963.0, 0.0],
    ["2018-06-20", 1113.91, 1115.7, 1108.5, 2483108596.0, 0.0],
    ["2018-06-19", 1109.97, 1111.18, 1100.98, 2474325879.0, 862571.0],
    ["2018-06-18", 1117.99, 1119.21, 1110.04, 2493057046.0, 0.0],
    ["2018-06-15", 1121.1, 1121.58, 1109.93, 2463874945.0, 0.0],
    ["2018-06-14", 1120.76, 1122.12, 1116.44, 2463127962.0, 0.0],
    ["2018-06-13", 1114.86, 1124.46, 1112.88, 2450155230.0, 0.0],
    ["2018-06-12", 1120.25, 1121.15, 1112.83, 2462007117.0, 0.0],
    ["2018-06-11", 1114.63, 1118.05, 1112.01, 2449650671.0, 0.0],
    ["2018-06-08", 1111.2, 1112.16, 1102.66, 2442105767.0, 0.0],
    ["2018-06-07", 1109.48, 1118.75, 1102.9, 2438327397.0, 191816.0],
    ["2018-06-06", 1117.0, 1117.09, 1105.74, 2455048936.0, 0.0],
    ["2018-06-05", 1106.01, 1112.97, 1103.43, 2430909857.0, 346972.0],
    ["2018-06-04", 1103.42, 1104.58, 1099.21, 2425545381.0, 0.0],
    ["2018-06-01", 1102.46, 1102.7, 1093.2, 2423453734.0, 0.0],
    ["2018-05-31", 1088.83, 1097.49, 1087.08, 2393487588.0, 0.0],
    ["2018-05-30", 1096.93, 1099.85, 1091.68, 2411283306.0, 469499.0],
    ["2018-05-29", 1087.44, 1091.72, 1079.98, 2390893357.0, 0.0],
    ["2018-05-25", 1094.13, 1098.43, 1092.1, 2405594255.0, 0.0],
    ["2018-05-24", 1092.39, 1096.34, 1083.52, 2401771889.0, 0.0],
    ["2018-05-23", 1094.41, 1094.5, 1084.83, 2406219212.0, 185512.0],
    ["2018-05-22", 1095.0, 1104.33, 1094.13, 2407701127.0, 0.0],
    ["2018-05-21", 1096.62, 1101.64, 1092.96, 2411252682.0, 202477.0],
    ["2018-05-18", 1090.89, 1096.84, 1090.21, 2398856873.0, 259167.0],
    ["2018-05-17", 1097.41, 1104.53, 1091.34, 2413470994.0, 0.0],
    ["2018-05-16", 1098.61, 1102.09, 1087.58, 2416109220.0, 782895.0],
    ["2018-05-15", 1087.65, 1088.25, 1078.78, 2392766791.0, 0.0],
    ["2018-05-14", 1090.71, 1096.57, 1087.95, 2399511668.0, 766699.0],
    ["2018-05-11", 1083.08, 1088.67, 1079.85, 2383471361.0, 0.0],
    ["2018-05-10", 1101.87, 1103.25, 1091.75, 2424832795.0, 0.0],
    ["2018-05-09", 1088.15, 1089.28, 1073.0, 2394635509.0, 118827.0],
    ["2018-05-08", 1077.7, 1085.93, 1070.79, 2371748134.0, 592593.0],
    ["2018-05-07", 1084.66, 1087.53, 1079.0, 2387663900.0, 0.0],
    ["2018-05-04", 1075.86, 1078.01, 1052.43, 2368297663.0, 0.0],
    ["2018-05-03", 1060.52, 1062.14, 1041.55, 2334521565.0, 0.0],
    ["2018-05-02", 1060.05, 1068.97, 1057.64, 2333499418.0, 0.0],
    ["2018-05-01", 1069.2, 1069.57, 1053.87, 2353646199.0, 0.0]
];

const container = document.getElementById('example');

function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    td.style.fontWeight = 'bold';
    td.style.color = 'green';
    td.style.background = '#CEC';
}

const hot = new Handsontable(container, {
    data: data,
    cells: function (row, col) {
        var cellProperties = {};
        var data = this.instance.getData();
    
        if (row === 0 || data[row] && data[row][col] === 'readOnly') {
          cellProperties.readOnly = true; // make cell read-only if it is first row or the text reads 'readOnly'
        }
        if (row === 0) {
          cellProperties.renderer = firstRowRenderer; // uses function directly
        }
        return cellProperties;
      }
});

