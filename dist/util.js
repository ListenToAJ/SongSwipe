const API_URI = function() {
    let uri = document.location.origin;
    
    const port_matching = uri.match(':[0-9]+');
    if (port_matching != null) {
        uri = uri.replace(port_matching[0], ':9000')
    }
    return uri + '/.netlify/functions/api';
}();

const getSecondsSinceEpoch = () => Math.floor(Date.now() / 1000);

/*
 * Checks to see if the access token that is saved is expired.
 *
 * @return {bool} status - true if expired, false if still valid
 */
function checkAccessTokenExpiration() {
    const secondsSinceEpoch = getSecondsSinceEpoch();

    let expiration = localStorage.getItem('token_expiration');
    if (expiration != null && expiration < secondsSinceEpoch) {
        return true;
    }
    return false;
}

/*
 * Refresh the access token and return new access token.
 *
 * @return {string} access_token - new access token
 */
async function refreshAccessToken() {
    const refresh_url = new URL(API_URI + '/auth/refresh');
    const refresh_token = localStorage.getItem('refresh_token');
    if (refresh_token != null) {
        refresh_url.searchParams.set('refresh_token', refresh_token);

        const response = await fetch(refresh_url.toString());
        const data = await response.json();
    
        const secondsSinceEpoch = getSecondsSinceEpoch();
        
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_expiration', secondsSinceEpoch + data.expires_in);
        return data.access_token;
    }
    return null;
}

/*
 * Replace the page HTML with an error message.
 * 
 * @param {string} message - the error message you wish to display 
 */
function renderError(error_message) {
    document.body.innerHTML = '';
    let error_div = document.createElement('div');
    error_div.id = 'error_div'

    let header = document.createElement('p');
    header.innerHTML = 'An Error Has Occured!'; // TODO: add fix instructions

    let message = document.createElement('p');
    message.innerHTML = error_message;

    error_div.appendChild(header)
    error_div.appendChild(message);
    document.body.appendChild(error_div);
}