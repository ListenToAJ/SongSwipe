const base_url = 'https://api.spotify.com/v1'

export enum HttpMethod { GET, POST, PATCH, PUT, DELETE }
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
* Fetch the playlists of a user. Calls the /me/playlist endpoint.
* 
* @param {string} bearer - the user's bearer token for authorization.
* @return {list} playlists - the user's playlists (see link below for format).
* https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
*/
export async function fetchUserPlaylists(access_token: string) {
    const request = createRequest('/me/playlists', access_token, HttpMethod.GET); 

    // TODO: add error handling
    const response = await fetch(request);
    const data = await response.json();
    return data;
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

    // TODO: add error handling
    const response = await fetch(request);
    const data = await response.json();
    return data;
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

    // TODO: add error handling
    const response = await fetch(request);
    const data = await response.json();
    return data;
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

    // TODO: add error handling
    const response = await fetch(request);
    const data = await response.json();
    return data;
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
    let playlist = await fetchPlaylist(access_token, playlist_id);

    // !! Seems to for the most part but there is an issue where it counts local files 
    // !! We need to add ignore logic for that into this 
    let track_list: any[] = []
    while (track_list.length != playlist.tracks.total) {
        let data = await fetchPlaylistTracks(access_token, playlist_id, track_list.length);
        for (const element of data.items) {
            track_list.push({
                track_id: element.track.id,
                name: element.track.name,
                album_name: element.track.album.name,
                album_cover_img_url: element.track.album.images[0].url,
                artists: element.track.artists.map((artist: any) => artist.name),
            });
        }
    }

    return {
        name: playlist.name,
        id: playlist.id,
        tracks: track_list,
        img_url: playlist.images[0].url,
    };
}