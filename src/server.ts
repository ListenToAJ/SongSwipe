import serverless from 'serverless-http'
import { config } from 'dotenv';
import express, { Router } from 'express'

config();

const app = express();
const router = Router();

router.get('/', async (req, res) => {
    res.send("Hello World!");
});

app.use("/.netlify/functions/server", router);

// Use this for local testing
//app.listen('8080', () => {
//     console.log('Now listening on port 8080.');
//})

export const handler = serverless(app);