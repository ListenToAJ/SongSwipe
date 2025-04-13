import { ERROR_RESPONSES, generateRandomString, StatusCodes } from "./util";
import { config } from 'dotenv';
import { fetchPlaylist, fetchUserInfo, fetchUserPlaylists, buildPlaylist, removeSongsFromPlaylist, createPlaylist, addSongsToPlaylist } from "./spotify-interactions";
import { getSpotifyPreviewUrl } from "./spotify-preview";

// Load .env with Spotify credentials & set constants for env secrets
config();
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID ?? "";
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const redirect_uri = process.env.REDIRECT_URI_AUTH ?? "";
const redirect_home = process.env.REDIRECT_URI_HOME ?? "";

/*
 * Endpoint: /auth/login
 * Description: Used to begin the Oauth auth flow. Redirects the user to the Spotify sign in.
 * 
 * Response: Redirect to the Spotify login in page.
 */
export function authLogin(req: any, res: any) {
    // TODO: will need to be altered with write permissions
    const scope = 'playlist-read-private \
                    user-read-email \
                    user-read-private \
                    playlist-modify-public \
                    playlist-modify-private';

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

/*
 * Endpoint: /auth/callback
 * Description: Used as a callback after signing in with Spotify. After a successful sign in 
 *              redirects the user to the playlists page.
 * 
 * Response: Redirect to the playlists page.
 */
export async function authCallback(req: any, res: any) {
    const code = req.query.code?.toString() ?? "";

    const request = new Request('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
        },
        body: `grant_type=authorization_code&redirect_uri=${redirect_uri}&code=${code}`,
    });

    const response = await fetch(request);
    const data = await response.json();

    if (response.status != 200) {
        // TODO: redirect to an error page
        res.redirect(redirect_home);
        return;
    }

    res.redirect(redirect_home + `?data=${JSON.stringify(data)}`);
}

/*
 * Endpoint: /auth/refresh
 * Description: use refresh token to get new bearer token
 * 
 * Request:
 *  query_params: refresh_token
 * 
 * Response: New access token with expiration date
 */
export async function authRefresh(req: any, res: any) {
    const refresh_token = req.query.refresh_token?.toString() ?? "";

    if (refresh_token == "") {
        res.status(StatusCodes.BAD_REQUEST);
        res.json(ERROR_RESPONSES.INVALID_TOKEN);
        return;
    }

    const request = new Request('https://accounts.spotify.com/api/token', {
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: spotify_client_id,
        }),
    })

    const response = await fetch(request);
    const data = await response.json();

    if (response.status != 200) {
        res.status(StatusCodes.BAD_REQUEST);
        res.json(ERROR_RESPONSES.REFRESH_ERROR);
        return;
    }

    res.status(StatusCodes.OK);
    res.json(data);
}

/*
 * Endpoint: /user
 * Description: Pulls data of the user's account. 
 * 
 * Request:
 *  headers: authorization=bearer_token
 * 
 * Response: json of user's data. 
 *           See fetchUserInfo() comment header for the link to the documentation with data format
 */
export async function userData(req: any, res: any) {
    const access_token = req.headers.authorization ?? "";

    let data = undefined, status = StatusCodes.OK;
    if (access_token != "") {
        let res = await fetchUserInfo(access_token);
        data = res.data;
        status = res.status;
    } else {
        data = ERROR_RESPONSES.NO_AUTH;
        status = StatusCodes.BAD_REQUEST;
    }

    res.status(status);
    res.json(data);
}

/*
 * Endpoint: /user/playlists
 * Description: Pulls data of the user's playlists, public & private.
 *
 * Request:
 *  headers: authorization=bearer_token
 * 
 * Response: json of user's data. 
 *           See fetchUserPlaylists() comment header for the link to the documentation with data format
 */
export async function userPlaylists(req: any, res: any) {
    const access_token = req.headers.authorization ?? "";
    
    // TODO: This has a limit on how much you can grab so we need to add that in
    let data = undefined, status = StatusCodes.OK;
    if (access_token != "") {
        let res = await fetchUserPlaylists(access_token);
        data = res.data;
        status = res.status;
    } else {
        data = ERROR_RESPONSES.NO_AUTH;
        status = StatusCodes.BAD_REQUEST;
    }
    
    res.status(status);
    res.json(data);
}

/*
 * Endpoint: /playlist
 * Description: Pulls data of a playlist from its id.
 * 
 * Request:
 *  headers: authorization=bearer_token
 *  query params: playlist_id 
 *  
 * Response: json of user's data. 
 *           See fetchPlaylist() comment header for the link to the documentation with data format
 */
export async function playlistData(req: any, res: any) {
    const access_token = req.headers.authorization ?? "";
    const playlist_id = req.query.playlist_id?.toString() ?? "";

    let data = undefined, status = StatusCodes.OK;
    if (access_token != "" && playlist_id != "") {
        let res = await fetchPlaylist(access_token, playlist_id);
        data = res.data;
        status = res.status;
    } else {
        data = ERROR_RESPONSES.NO_AUTH_OR_PARAM;
        status = StatusCodes.BAD_REQUEST;
    }
    
    res.status(status);
    res.json(data);
}

/*
* Endpoint: /playlist/build
* Description: Builds a filtered json of a playlist's data based on its id.
*
* Request:
*  headers: authorization=bearer_token
*  query_params: playlis_id
* 
* Response: json of user's data. 
*           See buildPlaylist() comment header for the link to the documentation with data format
*/
export async function playlistBuild(req: any, res: any) {
    const access_token = req.headers.authorization ?? "";
    const playlist_id = req.query.playlist_id?.toString() ?? "";
    
    let data = undefined, status = StatusCodes.OK;
    if (access_token != "" && playlist_id != "") {
        let res = await buildPlaylist(access_token, playlist_id);
        data = res.data;
        status = res.status;
    } else {
        data = ERROR_RESPONSES.NO_AUTH_OR_PARAM;
        status = StatusCodes.BAD_REQUEST;
    }
    
    res.status(status);
    res.json(data);
}

/*
* Endpoint: /playlist/create
* Description: Create a new playlist for the user. 
* 
* Request:
*  headers: authorization=bearer_token
*  body: name, description, is_public
* 
* Response: json of new playlist.
*           See createPlaylist() comment to see format.
*/
export async function playlistCreate(req: any, res: any){
    const access_token = req.headers.authorization ?? "";
    let name = "", description = "", is_public = true;
    if ('name' in req.body) name = req.body['name'];
    if ('description' in req.body) description = req.body['description'];
    if ('is_public' in req.body) is_public = req.body['is_public'];
    
    let data = undefined, status = StatusCodes.OK;
    if (access_token != "" && name != "") {
        const userData = await fetchUserInfo(access_token);
        if (userData.status != 200) {
            res.status(userData.status).json(userData);
        }

        const createRes = await createPlaylist(access_token, userData.data.id, name, description, is_public);
        data = createRes.data;
        status = createRes.status;
    } else {
        data = ERROR_RESPONSES.NO_AUTH_OR_PARAM;
        status = StatusCodes.BAD_REQUEST;
    }

    res.status(status).json(data);
}

/*
* Endpoint: /song
* Description: API endpoint to get a Spotify track preview URL
* 
* Request: 
*   query_params: track_id
*   
* Response: url of songs preview mp3
*/
export async function songPreview(req: any, res: any) {
    const track_id = req.query.track_id?.toString() ?? "";
    let data = undefined;
    let status = StatusCodes.OK;

    if (track_id !== "") {
        const res = await getSpotifyPreviewUrl(track_id);
        data = res;
    } else {
        data = ERROR_RESPONSES.NO_AUTH_OR_PARAM;
        status = StatusCodes.BAD_REQUEST;
    }
    res.status(status).json(data);
}

/*
* Endpoint: /playlist/add
* Description: Add songs into a playlist. 
* 
* Request: 
*   headers: authorization=bearer_token
*   query_params: playlist_id
*   body: list of track ids to add 
* 
* Response: Playlist Snapshot ID
*/
export async function songAdd(req: any, res: any) {
    const access_token = req.headers.authorization ?? "";
    const playlist_id = req.query.playlist_id?.toString() ?? "";

    let to_add = [];
    if ("to_add" in req.body) to_add = req.body['to_add'];

    let data = undefined, status: any = StatusCodes.OK;
    if (access_token != "" && playlist_id != "" && to_add.length != 0) {
        const res = await addSongsToPlaylist(access_token, playlist_id, to_add);
        data = res.data;
        status = res.status;
    } else {
        data = ERROR_RESPONSES.NO_AUTH_OR_PARAM;
        status = StatusCodes.BAD_REQUEST;
    }

    res.status(status).json(data);
}

/*
* Endpoint: /playlist/remove
* Description: Remove songs from the playlist. 
* 
* Request: 
*   headers: authorization=bearer_token
*   query_params: playlist_id
*   body: list of track ids to remove 
* 
* Response: Playlist Snapshot ID
*
*/
export async function songRemove(req: any, res: any) {
    const access_token = req.headers.authorization ?? "";
    const playlist_id = req.query.playlist_id?.toString() ?? "";
    
    let to_remove = []; 
    if ("to_remove" in req.body) to_remove = req.body['to_remove'];

    let data = undefined, status: any = StatusCodes.OK;
    if (access_token != "" && playlist_id != "" && to_remove.length != 0) {
        const res = await removeSongsFromPlaylist(access_token, playlist_id, to_remove);
        data = res.data;
        status = res.status;
    } else {
        data = ERROR_RESPONSES.NO_AUTH_OR_PARAM;
        status = StatusCodes.BAD_REQUEST;
    }

    res.status(status).json(data);
}
