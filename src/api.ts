import express, { Router } from 'express'
import serverless from 'serverless-http'
import { config } from 'dotenv';
import { generateRandomString } from './util';
import { fetchUserInfo, fetchUserPlaylists } from './spotify-interactions';
import cors from 'cors';

// TODO: document routes

config(); // Load .env with Spotify credentials 
// Set constants for env secrets
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID ?? "";
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const redirect_uri = process.env.REDIRECT_URI_AUTH ?? "";
const redirect_home = process.env.REDIRECT_URI_HOME ?? "";

const app = express();
const router = Router();

app.use(cors());

router.get('/auth/login', async (req, res) => {

    // TODO: will need to be altered
    const scope = 'playlist-read-private \
                   user-read-email \
                   user-read-private';

    const state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
    });
    
    res.redirect('https://accounts.spotify.com/authorize?' + auth_query_parameters.toString());
});

router.get('/auth/callback', async (req, res) => {
    const code = req.query.code?.toString() ?? "";

    const headers = new Headers();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    headers.set('Authorization', 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')));

    const request = new Request('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: headers,
        body: `grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}`,
    });

    // TODO: ADD ERROR HANDLING
    const response = await fetch(request);
    const data = await response.json();
    
    res.redirect(redirect_home + `?data=${JSON.stringify(data)}`);
});

router.get('/playlists', async (req, res) => {
    // TODO: this needs a lot of work lol for a simple test
    const data = await fetchUserPlaylists(req.headers.authorization ?? "");
    res.json(data);
});

router.get('/user', async (req, res) => {
    // TODO: same as playlist route
    const data = await fetchUserInfo(req.headers.authorization ?? "");
    res.json(data);
})

app.use("/.netlify/functions/api", router);

export const handler = serverless(app);