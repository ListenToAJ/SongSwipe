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

    /*
    Create a staging card for a song
    Params - name {string}, artists {string}, imgUrl {string}
    */
    function createStagingCard(name, artists, imgUrl) {
        let card = document.createElement('div');
        card.className = 'songContainer';
        
        let album = document.createElement('img');
        album.className = 'stageAlbum';
        album.src = imgUrl;
        card.appendChild(album);

        let stageInfo = document.createElement('div');
        stageInfo.className = 'stageInfo';

        let title = document.createElement('div');
        title.className = 'title';
        title.innerText = name;

        let artist = document.createElement('div');
        artist.className = 'artist';
        artist.innerHTML = artists.join(' ');

        stageInfo.appendChild(title);
        stageInfo.appendChild(artist);
        card.appendChild(stageInfo);

        let remove = document.createElement('div');
        remove.className = 'removeSong';

        card.appendChild(remove);

        let container = document.getElementById('stageContainer');
        container.appendChild(card);
    }

    let data = JSON.parse(localStorage.getItem(user_id));
    let songs = data[playlist_id];

    Object.keys(songs['left_tracks']).forEach((value, index) => {
        track = songs['left_tracks'][value];
        createStagingCard(track.track_name, track.track_artists, track.album_cover);
    })
});