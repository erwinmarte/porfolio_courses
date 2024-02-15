// logGenerator.js
"use strict";

const { google } = require('googleapis');
const { authenticate } = require('./googleAuth');
require('dotenv').config();

const driveFolder = process.env.DRIVE_FOLDER;

async function logGenerator(req, res, next) {
    const requestStart = Date.now();
    let logged = false;

    res.on('close', async () => {
        if (logged) return;

        const logEntry = {
            request: "On courses website erwin"
            method: req.method,
            timestamp: new Date(),
            processingTime: `${Date.now() - requestStart} ms`,
            resStatus: res.statusCode
        };

        try {
            await uploadLogEntryToDrive(logEntry);
            logged = true;
        } catch (err) {
            console.error('Error escribiendo el registro o cargando a Google Drive:', err);
        }
    });

    next();
}

async function uploadLogEntryToDrive(logEntry) {
    try {
        const auth = await authenticate();
        const drive = google.drive({ version: 'v3', auth });

        const existingFile = await drive.files.list({
            q: `'${driveFolder}' in parents and name='erwin-courses.txt' and trashed=false`,
            fields: 'files(id)',
        });

        let fileId = null;

        if (existingFile.data.files.length > 0) {
            fileId = existingFile.data.files[0].id;

            const currentContent = await drive.files.get({
                fileId: fileId,
                alt: 'media',
            });

            const newContent = currentContent.data + JSON.stringify(logEntry) + "," + '\n';

            await drive.files.update({
                fileId: fileId,
                media: {
                    mimeType: 'text/plain',
                    body: newContent,
                },
            });

            console.log('Registro actualizado en Google Drive correctamente.');
        } else {
            await drive.files.create({
                resource: {
                    name: 'erwin-courses.txt',
                    parents: [driveFolder],
                },
                media: {
                    mimeType: 'text/plain',
                    body: JSON.stringify(logEntry) + '\n',
                },
                fields: 'id',
            });

            console.log('Registro cargado a Google Drive correctamente.');
        }
    } catch (error) {
        console.error('Error cargando el registro a Google Drive:', error);
        throw error;
    }
}

module.exports = { logGenerator };
