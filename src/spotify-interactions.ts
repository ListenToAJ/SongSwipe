const base_url = 'https://api.spotify.com/v1'

/* 
* Fetch the playlists of a user. Calls the /me/playlist endpoint.
* 
* @param {string} bearer - the user's bearer token for authorization.
* @return {list} playlists - the user's playlists (see link below for format)
* https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
*/
export async function fetchUserPlaylists(access_token: string) {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${access_token}`);

    const request = new Request(base_url + '/me/playlists', {
        method: 'GET',
        headers: headers,
    });

    // TODO: add error handling
    const response = await fetch(request);
    const data = await response.json();
    return data;
}