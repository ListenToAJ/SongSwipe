import { Request, Response } from "express";
import { generateRandomString } from "./util";
import { config } from 'dotenv';
import { fetchPlaylist, fetchUserInfo, fetchUserPlaylists, buildPlaylist } from "./spotify-interactions";

// TODO: document endpoints

// Load .env with Spotify credentials & set constants for env secrets
config();
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID ?? "";
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const redirect_uri = process.env.REDIRECT_URI_AUTH ?? "";
const redirect_home = process.env.REDIRECT_URI_HOME ?? "";

export function authLogin(req: Request, res: Response) {
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

    // TODO: ADD ERROR HANDLING
    const response = await fetch(request);
    const data = await response.json();
    
    res.redirect(redirect_home + `?data=${JSON.stringify(data)}`);
}

export async function userData(req: Request, res: Response) {
    // TODO: same as playlist route
    const data = await fetchUserInfo(req.headers.authorization ?? "");
    res.json(data);
}

export async function userPlaylists(req: Request, res: Response) {
    // TODO: this needs a lot of work lol for a simple test
    const data = await fetchUserPlaylists(req.headers.authorization ?? "");
    res.json(data);
}

export async function playlistData(req: Request, res: Response) {
    // TODO: same as other spotify resource routes
    const data = await fetchPlaylist(req.headers.authorization ?? "", req.query.playlist_id?.toString() ?? "");
    res.json(data);
}

export async function playlistBuild(req: Request, res: Response) {
    // TODO: same as other spotify resource routes
    const data = await buildPlaylist(req.headers.authorization ?? "", req.query.playlist_id?.toString() ?? "");
    res.json(data);
}