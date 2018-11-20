/**
 * This file is for local development - building the projects locally on OpenFin
 */

const express = require('express');
const path = require('path');
const openfinLauncher = require('openfin-launcher');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Because we are only working locally with this file we'll hardcode the port
 */
const port = 8080;

app.listen(port, () => {
    console.log(`App being served on ${port}`);
    openfinLauncher.launchOpenFin({ configPath: `http://localhost:${port}/local.json`})
        .then(() => process.exit());
});