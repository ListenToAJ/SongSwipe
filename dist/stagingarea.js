$(document).ready(async function () { 
    const url = new URL(window.location.href);
    const user_id = url.searchParams.get('user_id');
    if (user_id == null) {
        renderError('No User Id Provided!');
    }
    
    const playlist_id = url.searchParams.get('playlist_id');
    if (playlist_id == null) {
        renderError('No Playilst Id Provided!');
    }
    // Read from Local Storage
    const user = JSON.parse(localStorage.getItem(user_id));
    // Declare save state variable for editing
    let save_state = user[playlist_id];
    /*
    Create a staging card for a song
    Params - name {string}, artists {string}, imgUrl {string}
    */
    function createStagingCard(track, trackId) {
        let card = document.createElement('div');
        card.className = 'songContainer';
        
        let album = document.createElement('img');
        album.className = 'stageAlbum';
        album.src = track.album_cover;
        card.appendChild(album);

        let stageInfo = document.createElement('div');
        stageInfo.className = 'stageInfo';

        let title = document.createElement('div');
        title.className = 'title';
        title.textContent = track.track_name;

        let artist = document.createElement('div');
        artist.className = 'artist';
        artist.textContent = track.track_artists.join(', ');

        stageInfo.appendChild(title);
        stageInfo.appendChild(artist);
        card.appendChild(stageInfo);
        
        // Create remove button
        let remove = document.createElement('div');
        remove.className = 'removeSong';
        card.appendChild(remove);

        let container = document.getElementById('stageContainer');
        container.appendChild(card);
        // Add click event listener to the remove div
        remove.addEventListener('click', function() {
            // Ask the user if they are sure
            let confirmUser = confirm('Are you sure you want to remove this song?');
                // If they say no, do nothing
            if (!confirmUser) {
                return;
                // If they say yes remove the song
            } else{
                // Adds itself back into the right tracks, and removes itself from the left tracks
                save_state = moveTrack(save_state, 'left', 'right', trackId);
                // Save the new state to local storage
                save(playlist_id, save_state, user_id);
                // Then remove from HTML
                container.removeChild(card);
            }
        });
    }

    let data = JSON.parse(localStorage.getItem(user_id));
    let songs = data[playlist_id];

    Object.keys(songs['left_tracks']).forEach((id, index) => {
        const track = songs['left_tracks'][id];
        createStagingCard(track, id);
    });
});