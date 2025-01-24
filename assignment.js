const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const LOG_FILE = 'requests.log';
const MAX_LOG_SIZE = 1 * 1024 * 1024;

app.use((req, res, next) => {
    const requestDetails = {
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        url: req.originalUrl,
        protocol: req.protocol,
        method: req.method,
        hostname: req.hostname,
    };

    logRequest(requestDetails);
    next();
});

function logRequest(details) {
    const logEntry = JSON.stringify(details) + '\n';
    fs.stat(LOG_FILE, (err, stats) => {
        if (!err && stats.size >= MAX_LOG_SIZE) {
            rotateLogFile();
        }
        fs.appendFile(LOG_FILE, logEntry, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    });
}

function rotateLogFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivedLogFile = `requests-${timestamp}.log`;

    fs.rename(LOG_FILE, archivedLogFile, (err) => {
        if (err) {
            console.error('Error rotating log file:', err);
        } else {
            console.log(`Log file rotated: ${archivedLogFile}`);
        }
    });
}

app.get('/logs', (req, res) => {
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading log file.');
        }
        res.type('text').send(data);
    });
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/test', (req, res) => {
    res.send('Testing log functionality!');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
