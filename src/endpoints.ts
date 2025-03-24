import { Request, Response } from "express";
import { generateRandomString, StatusCodes } from "./util";
import { config } from 'dotenv';
import { fetchPlaylist, fetchUserInfo, fetchUserPlaylists, buildPlaylist } from "./spotify-interactions";

// TODO: document endpoints and util functions

// Load .env with Spotify credentials & set constants for env secrets
config();
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID ?? "";
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const redirect_uri = process.env.REDIRECT_URI_AUTH ?? "";
const redirect_home = process.env.REDIRECT_URI_HOME ?? "";

export function authLogin(req: Request, res: Response) {
    // TODO: will need to be altered with write permissions
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
}

export async function authCallback(req: Request, res: Response) {
    const code = req.query.code?.toString() ?? "";

    const headers = new Headers();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    headers.set('Authorization', 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')));

    const request = new Request('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: headers,
        body: `grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}`,
    });

    const response = await fetch(request);
    const data = await response.json();

    if (response.status != 200) {
        // TODO: redirect to an error page
        res.redirect(redirect_home);
    }

    res.redirect(redirect_home + `?data=${JSON.stringify(data)}`);
}

export async function userData(req: Request, res: Response) {
    const access_token = req.headers.authorization ?? "";

    let data = undefined;
    let status = StatusCodes.OK;
    if (access_token != "") {
        let res = await fetchUserInfo(access_token);
        data = res.data;
        status = res.status;
    } else {
        data = { 'error': 'authorization token not provided' };
        status = StatusCodes.BAD_REQUEST;
    }

    res.status(status).json(data);
}

export async function userPlaylists(req: Request, res: Response) {
    const access_token = req.headers.authorization ?? "";
    
    let data = undefined;
    let status = StatusCodes.OK;
    if (access_token != "") {
        let res = await fetchUserPlaylists(access_token);
        data = res.data;
        status = res.status;
    } else {
        data = { 'error': 'authorization token not provided' };
        status = StatusCodes.BAD_REQUEST;
    }
    
    res.status(status).json(data);
}

export async function playlistData(req: Request, res: Response) {
    const access_token = req.headers.authorization ?? "";
    const playlist_id = req.query.playlist_id?.toString() ?? "";

    let data = undefined;
    let status = StatusCodes.OK;
    if (access_token != "" && playlist_id != "") {
        let res = await fetchPlaylist(access_token, playlist_id);
        data = res.data;
        status = res.status;
    } else {
        data = { 'error': 'authorization token or playlist_id not provided' };
        status = StatusCodes.BAD_REQUEST;
    }
    
    res.status(status).json(data);
}

export async function playlistBuild(req: Request, res: Response) {
    const access_token = req.headers.authorization ?? "";
    const playlist_id = req.query.playlist_id?.toString() ?? "";
    
    let data = undefined;
    let status = StatusCodes.OK;
    if (access_token != "" && playlist_id != "") {
        let res = await fetchPlaylist(access_token, playlist_id);
        data = res.data;
        status = res.status;
    } else {
        data = { 'error': 'authorization token or playlist_id not provided' };
        status = StatusCodes.BAD_REQUEST;
    }
    
    res.status(status).json(data);
}