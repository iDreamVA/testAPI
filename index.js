const express = require('express');
const app = express();
require('dotenv').config();

const line = require('@line/bot-sdk');

const util = require('util');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const config = {
    channelAccessToken: process.env.token,
    channelSecret: process.env.secretcode
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvents))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error('Error handling events:', err);
            res.status(200).send('Error');
        });
});

async function handleEvents(event) {
    console.log('Received event:', event);
    
    if (event.message.type === 'image') {
        if (event.message.contentProvider.type === 'line') {
            const downloadPath = path.join(__dirname, 'download', `${event.message.id}.jpg`);
            
            await downloadContent(event.message.id, downloadPath);
            
            return client.replyMessage(event.replyToken, [
                {
                    "type": "text",
                    "text": `Download เรียบร้อย`
                }
            ]);
        }
    }
}

async function downloadContent(mid, downloadPath) {
    const stream = await client.getMessageContent(mid);
    
    const pipelineSync = util.promisify(pipeline);
    
    const fileStream = fs.createWriteStream(downloadPath);
    
    await pipelineSync(stream, fileStream);
}

app.get('/', (_req, res) => {
    res.send('ok');
});

app.listen(7666, () => console.log('Server started on port 7666'));