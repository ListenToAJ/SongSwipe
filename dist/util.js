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

// Refactor Code Additions
function reloadPlaylist(reference, target) {
    for (let x = 0; x < reference.length; x++) {
        const song_index = target.findIndex(target => target.track_id === reference[x]);
        
        // Confirm index is found
        if (song_index !== -1) {
        // remove 'seen' tracks from current playlist to simulate where you last left off
            target.splice(song_index, 1);
        } else {
            alert("Cannot find Reference or Target")
        }
    }
}

// Saves the JSON
function save(playlist_id, save_state, userId) {
    //const thisJSON = getJSON();
    let data = JSON.parse(localStorage.getItem(userId))
    data[playlist_id] = save_state
    localStorage.setItem(userId, JSON.stringify(data));
}

// Creates the tracks object
function createTracksObject() {
    return {
        'left_tracks': {},
        'right_tracks': {},
        'index': 0
    };
}

function saveTrack(target, array, id, index, reference) {
    const array_name = array + '_tracks';
    
    const track_object = {
        'track_name': reference[index].name,
        'track_artists': reference[index].artists,
        'album_cover': reference[index].album_cover_img_url,
    };
    
    target[array_name][id] = track_object;
    return target;
}

function moveTrack(target, source, destination, trackId) {
    // Construct the source and destination keys
    const array_source = source + '_tracks';
    const array_destination = destination + '_tracks';
    
    // Check if the track exists in the source tracks
    if (target[array_source].hasOwnProperty(trackId)) {
        // Get the track object
        const track = target[array_source][trackId];
        
        // Add it to destination tracks
        target[array_destination][trackId] = track;
        
        // Remove it from source tracks
        delete target[array_source][trackId];
        
    } else {
        alert(`Track with ID ${trackId} not found in ${array_source}`);
    }
    return target;
}