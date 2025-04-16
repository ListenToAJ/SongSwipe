$(document).ready(async function () { 
    // Variable to control what interface you see
    let removalStage = true;
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
    let container = document.getElementById('stageContainer');
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

        container.appendChild(card);
        // Add click event listener to the remove div
        remove.addEventListener('click', function() {
            // Ask the user if they are sure
            let confirmUser = confirm(removalStage ?
                'Are you sure you want to KEEP this song?' :
                'Are you sure you want to REMOVE this song?');
            
                // If they say no, do nothing
            if (!confirmUser) {
                return;
                // If they say yes remove the song
            } else{
                if (removalStage) {
                    // Adds itself back into the right tracks, and removes itself from the left tracks
                    save_state = moveTrack(save_state, 'left', 'right', trackId);
                    // Save the new state to local storage
                    save(playlist_id, save_state, user_id);
                    // Then remove from HTML
                    container.removeChild(card);
                } else {
                    save_state = moveTrack(save_state, 'right', 'left', trackId);
                    // Save the new state to local storage
                    save(playlist_id, save_state, user_id);
                    // Then remove from HTML
                    container.removeChild(card);
                }

            }
        });
    }

    // Function to Generate Cards
    function generateCard(track_array) {
        let data = JSON.parse(localStorage.getItem(user_id));
        let songs = data[playlist_id];
        Object.keys(songs[track_array]).forEach((id, index) => {
            const track = songs[track_array][id];
            createStagingCard(track, id);
        });
    }
    
    // Default to removal track
    generateCard('left_tracks');

    // Toggle Button
    const removeOption = document.getElementById('removeOption');
    const keepOption = document.getElementById('keepOption');

    function selectOption(option) {
        if (option === 'remove') {
            removalStage = true;
            removeOption.classList.add('selected');
            removeOption.classList.remove('unselected');
            keepOption.classList.add('unselected');
            keepOption.classList.remove('selected');
        } else {
            removalStage = false;
            keepOption.classList.add('selected');
            keepOption.classList.remove('unselected');
            removeOption.classList.add('unselected');
            removeOption.classList.remove('selected');
        }
    }

    removeOption.addEventListener('click', function() {
        selectOption('remove');
        // remove any existing cards
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        generateCard('left_tracks');
    });
    
    keepOption.addEventListener('click', function() {
        selectOption('keep');
        // remove any existing cards
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        generateCard('right_tracks');
    });
});