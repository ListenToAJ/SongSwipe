
$(document).ready(async function () {
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
    }
});