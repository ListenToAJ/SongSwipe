import express, { Router } from 'express'
import serverless from 'serverless-http'
import { config } from 'dotenv';
import { generateRandomString } from './util';


config(); // Load .env with Spotify credentials 
// Set constants for env secrets
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID ?? "";
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const redirect_uri = process.env.REDIRECT_URI ?? "";

const app = express();
const router = Router();

router.get('/', async (req, res) => {
    res.send("Hello World");
});

router.get('/auth/login', async (req, res) => {

    var scope = ""; // TODO: LOOK INTO SCOPES

    var state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
    });

    res.redirect('https://accounts.spotify.com/authorize?' + auth_query_parameters.toString());
});

router.get('/auth/callback', (req, res) => {

});

app.use("/.netlify/functions/api", router);

export const handler = serverless(app);