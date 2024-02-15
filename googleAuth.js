// googleAuth.js
"use strict";

const { google } = require('googleapis');
require('dotenv').config();
const client_email = process.env.CLIENT_EMAIL;
const private_key = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');

let storedCredentials;

async function authenticate() {
    const oAuth2Client = new google.auth.JWT({
        email: client_email,
        key: private_key,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    if (storedCredentials) {
        oAuth2Client.setCredentials(storedCredentials);
    } else {
        await getNewToken(oAuth2Client);
    }

    return oAuth2Client;
}

async function getNewToken(oAuth2Client) {
    await oAuth2Client.authorize();

    storedCredentials = oAuth2Client.credentials;

    return storedCredentials;
}

module.exports = { authenticate };

