const base_url = 'https://api.spotify.com/v1'
// TODO: make a better factory method for making api calls because its just gonna be copy and paste over and over.
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

/*
* Fetch the profile data for the user. Calls the /me endpoint.
*
* @param {string} bearer - the user's bearer token for authorization.
* @return {object} info - the user's info (see link below for contents)
* https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
*/
export async function fetchUserInfo(access_token: string){
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${access_token}`);

    const request = new Request(base_url + '/me', {
        method: 'GET',
        headers: headers,
    });

    // TODO: add error handling
    const response = await fetch(request);
    const data = await response.json();
    return data;
}