/* 
* A function to generate a random string of a specified length.
* Provided by Spotify documentation.
* https://developer.spotify.com/documentation/web-playback-sdk/howtos/web-app-player
* This is used to protect against attacks such as cross-site request forgery.
*
* @param {number} length - the length of the random state
* @return {string} text - a random string of specified length
*/
export function generateRandomString(length: number) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}