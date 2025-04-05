import { ERROR_RESPONSES, HttpMethod, StatusCodes } from "./util";

const base_url = 'https://api.spotify.com/v1'

// Interfaces to store data in a readable form
export interface SpotifyImage {
    height: number;
    width: number;
    url: string;
}

export interface SpotifyUser {
    display_name: string;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
}

export interface SpotifyPlaylist {
    collaborative: boolean;
    description: string;
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    owner: SpotifyUser;
    primary_color: string | null;
    public: boolean;
    snapshot_id: string;
    tracks: {
        href: string;
        total: number;
    };
    type: string;
    uri: string;
}

/*
* Create the request needed with specified endpoint. 
* 
* @param {string} endpoint - the endpoint you wish to make the request to.
* @return {request} request - the request object for the interaction.
*/
export function createRequest(endpoint: string, access_token: string, method: HttpMethod) {
    let headers = new Headers();
    headers.set('Authorization', ` Bearer ${access_token}`);
    
    let request = new Request(base_url + endpoint, {
        method: HttpMethod[method],
        headers: headers,
    });
    return request
}

/*
* Check the response that has been received and return data based on the error.
* 
* @param {Response} res - the response you wish to check
* @return {object} data - if valid an object that is in the body of the response, if not valid 
*                         a simple object with an error attribute that explains issue
*/
export async function checkResponse(res: Response) {
    let data = undefined;

    switch(res.status) {
    case StatusCodes.OK:
        data = await res.json();
        break;
    case StatusCodes.UNAUTHORIZED:
        data = ERROR_RESPONSES.INVALID_TOKEN;
        break;
    case StatusCodes.NOT_FOUND:
        data = ERROR_RESPONSES.NOT_FOUND;
        break;
    default:
        data = ERROR_RESPONSES.UNHANDLED;
    }

    return data;
}

/*  
* Fetch the playlists of a user. Calls the /me/playlist endpoint.
* 
* @param {string} bearer - the user's bearer token for authorization.
* @return {list} playlists - the user's playlists (see link below for format).
* https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
*/
export async function fetchUserPlaylists(access_token: string) {
    const request = createRequest('/me/playlists', access_token, HttpMethod.GET); 

    const response = await fetch(request);
    const data = await checkResponse(response);
    return { data: data, status: response.status };
}

/*
* Fetch the profile data for the user. Calls the /me endpoint.
*
* @param {string} bearer - the user's bearer token for authorization.
* @return {object} info - the user's info (see link below for contents).
* https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
*/
export async function fetchUserInfo(access_token: string) {
    const request = createRequest('/me', access_token, HttpMethod.GET);

    const response = await fetch(request);
    const data = await checkResponse(response);
    return { data: data, status: response.status };
}

/*
* Fetch a playlist. Calls the /playlists/{playlist_id} endpoint.
*
* @param {string} bearer - the user's bearer token needed here if the playlist is private.
* @param {string} playlist_id - the id for the playlist.
* @return {object} playlist_info - the data of the spotify playlist. (see link below for format)
* https://developer.spotify.com/documentation/web-api/reference/get-playlist
*/
export async function fetchPlaylist(access_token: string, playlist_id: string) {
    const request = createRequest(`/playlists/${playlist_id}`, access_token, HttpMethod.GET);

    const response = await fetch(request);
    const data = await checkResponse(response);
    return { data: data as SpotifyPlaylist, status: response.status };
}

// Helper function to export playlist data id
export function getPlaylistId(playlistData: SpotifyPlaylist): string {
    return playlistData.id;
}
/*
* Fetch the tracks from a playlist with an offset. Calls the /playlists/{playlist_id}/tracks endpoint.
* 
* @param {string} bearer - the user's bearer token needed here because playlist may be private
* @param {string} playlist_id - the playlist id
* @param {number} offset - the offset for the tracks (can only get 100 at a time so this lets you get the rest)
* @return {object} tracks_info - playlist track info (see link below for format)
* https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
*/
export async function fetchPlaylistTracks(access_token: string, playlist_id: string, offset: number) {
    let params = new URLSearchParams();
    params.set('offset', String(offset))
    const request = createRequest(`/playlists/${playlist_id}/tracks?${params.toString()}`, access_token, HttpMethod.GET)

    const response = await fetch(request);
    const data = await checkResponse(response);
    return { data: data, status: response.status };
}

/*
* Build a JSON that contains filtered data of the playlist. 
* Data includes: img_url, name, tracks, id
* Track data includes: name, album_name, album_cover_img_url, artist_name, track_id.
* 
* @param {string} bearer - the user's bearer token needed here because the playlist may be private.
* @param {string} playlist_id - the id of the playlist you wish to filter.
* @return {object} object that includes filtered playlist data st
*/
export async function buildPlaylist(access_token: string, playlist_id: string) {
    let res = await fetchPlaylist(access_token, playlist_id);
    let playlist = res['data']

    let track_list: any[] = []
    while (track_list.length != playlist.tracks.total) {
        let { data, status } = await fetchPlaylistTracks(access_token, playlist_id, track_list.length);

        if (status != StatusCodes.OK) {
            return { 'data': { 'error': 'error fetching tracks'}, 'status': StatusCodes.INTERNAL_SERVER_ERROR };
        }

        for (const element of data.items) {
            if (!element.is_local)
                track_list.push({
                    track_id: element.track.id,
                    name: element.track.name,
                    album_name: element.track.album.name,
                    album_cover_img_url: element.track.album.images[0].url,
                    artists: element.track.artists.map((artist: any) => artist.name),
                });
            else playlist.tracks.total -= 1;
        }
    }

    return { 'data': {
                name: playlist.name,
                id: playlist.id,
                tracks: track_list,
                img_url: playlist.images[0].url,
            }, 
            'status': StatusCodes.OK,
    };
}

// Kat's Edits
