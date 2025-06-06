
$(document).ready(async function () {
    // Variables
        // Make an array of playlist that are displayed
    const displayedPlaylistIds = [];

    let access_token = localStorage.getItem('access_token');
    
    const headers = new Headers();
    headers.set('Authorization', access_token);
    headers.set('Access-Control-Allow-Origin', '*');
    
    const request_user = new Request(`${API_URI}/user`, {
        method: 'GET',
        headers: headers,
    });
    
    if (checkAccessTokenExpiration()) access_token = refreshAccessToken();
    if (access_token == null) renderError('Error refreshing access token.');
    const response_user = await fetch(request_user);
    const data_user = await response_user.json();

    let header_text = document.getElementById('user_title');
    header_text.innerText = data_user.display_name + '\'s Playlists';

    let user_icon = document.getElementById('user_icon');
    if (data_user.images != null)
        user_icon.src = data_user.images[0].url; 
    else 
        user_icon.src = 'assets/img/default_icon.jpg';
    
    function create_playlist_card(playlist) {
        var card = document.createElement('div');
        card.className = 'playlist_card';
        
        var img = document.createElement('img');
        img.className = 'playlist_cover';
        if (playlist.images != null)
            img.src = playlist.images[0].url;
        else 
            img.src = 'assets/img/default_playlist_cover.png';
        
        var title_text = document.createElement('p');
        title_text.className = 'playlist_title';
        title_text.innerText = playlist.name;

        card.appendChild(img);
        card.appendChild(title_text);

        // Redirect to cards page
        card.addEventListener('click', async () => {
            // Send request ot create files for metric collection will not do anything if metrics aren't enabled
            let metrics_params = new URLSearchParams();
            metrics_params.set('playlist_id', playlist.id);
            metrics_params.set('user_id', data_user.id);
            metrics_params.set('username', data_user.display_name);
            metrics_params.set('playlist_name', playlist.name);
            const information_metric_request = new Request(`${API_URI}/metrics/information?${metrics_params.toString()}`, {
                method: 'POST',
            });
            await fetch(information_metric_request);
            
            let params = new URLSearchParams();
            params.set('playlist_id', playlist.id);

            window.location.href = window.location.pathname.replace('playlists', 'cards') + `?${params.toString()}`;
        })

        return card;
    }

    const request_playlists = new Request(`${API_URI}/user/playlists`, {
        method: 'GET',
        headers: headers,
    });

    if (checkAccessTokenExpiration()) access_token = refreshAccessToken();
    if (access_token == null) renderError('Error refreshing access token.');
    const response = await fetch(request_playlists);
    const data_playlists = await response.json();

    let playlist_container = document.getElementById('playlists_container');
    for (i = 0; i < data_playlists.items.length && data_playlists.items != null; i++) {
        playlist_container.appendChild(create_playlist_card(data_playlists.items[i]));
        // Add them to current display list
        displayedPlaylistIds.push(data_playlists.items[i].id);
    }

    // Then read local storage to see if User has any saved playlists that are not in their library (via Search)
    try {
        // Make an array of playlist ids that are in Saved User data but not in user's library
        const missingPlaylistIds = [];
        let user = JSON.parse(localStorage.getItem(data_user.id));
        if (user === null) {
            // New User so they have no save data - we don't care
        } else {
            // They have Saved Data - pull playlist those first
            // Check each playlist ID in user.playlists (from localStorage)
            for (const savedPlaylist of Object.keys(user)) {
                // Get the playlist ID from localStorage
                const savedPlaylistId = savedPlaylist;
                
                // Assume the playlist is missing from API results until proven otherwise
                let foundInApiResults = checkIfPlaylistExists(savedPlaylistId);
                
                // If playlist is in localStorage but not in API results, add to our missing list
                if (!foundInApiResults) {
                    missingPlaylistIds.push(savedPlaylistId);
                }
            }
            // Add them to container
            for (i = 0; i < missingPlaylistIds.length; i++) {
                getPlaylistFromId(missingPlaylistIds[i]);
                // Add them to current display list
                displayedPlaylistIds.push(missingPlaylistIds[i]);
            }
        }
    } catch (error) {
        alert(error);
    }
    // Variable to Toggle if a URL card has been added
    let urlCard = false; // False is default behavior as we expect the user to not search when first loading

    // URL SEARCH CONFIGURATION
    const urlSearchButton = document.getElementById('playlists_url_button');
    const urlSearch = document.getElementById('url_search');

    // WHEN USER SUBMITS FORM TAKE STRING
    urlSearchButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent form submission
        const playlistUrl = urlSearch.value.trim();
        const playlistId = getPlaylistIdFromUrl(playlistUrl);
        if (playlistId != null) {
            // IF IT IS A VALID URL, CALL API AND GET PLAYLIST ID
                // Check if we already have a card for this URL
            if (!checkIfPlaylistExists(playlistId)) {
                // Continue with adding song into playlist
                if (urlCard) {
                    // Remove the URL card if it already exists
                        // Remove most recent search from displayedPlaylistIds
                        displayedPlaylistIds.pop();
                        // Remove the card then generate new search card
                        playlist_container.removeChild(playlist_container.firstChild);
                        // Make new card and append to container
                        getPlaylistFromId(playlistId);
                        displayedPlaylistIds.push(playlistId); // Add to displayedPlaylistIds
                } else {
                    // Make new card and append to container
                    getPlaylistFromId(playlistId);
                    urlCard = true; // Set to true so we know we have added a card
                    displayedPlaylistIds.push(playlistId); // Add to displayedPlaylistIds
                }
            } else {
                alert('Playlist already exists on this page.');
            }
        } else {
            alert('Please enter a valid playlist URL');
        }
    });
    // Function to call API and get playlist from URL
    async function getPlaylistFromId(playlistId) {
        // Get Token to use API
            // Will need to refactor eventually
        if (checkAccessTokenExpiration()) access_token = refreshAccessToken();
        if (access_token == null) renderError('Error refreshing access token.');
        // GET PLAYLIST ID FROM URL
        let playlist_url = new URL(`${API_URI}/playlist`);
        playlist_url.searchParams.set('playlist_id', playlistId);
        // MAKE API CALL
        const request_playlist = new Request(playlist_url.toString(), {
            method: 'GET',
            headers: headers,
        });

        // GET RESPONSE
        const response = await fetch(request_playlist);
        const data = await response.json();

        // APPEND NEW CARD TO CONTAINER
        playlist_container.prepend(create_playlist_card(data));
    }

    // GET PLAYLIST ID FROM URL
    function getPlaylistIdFromUrl(url) {
        const regex = /https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]{22})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Function to check if it is found in current list of songs
    function checkIfPlaylistExists(playlistId) {
        return displayedPlaylistIds.includes(playlistId);
    }
});