$(document).ready(async function () {
    const uri = 'http://127.0.0.1:9000/' // TODO: make uri not hardcoded

    const url = new URL(window.location.href);
    const oauth_data = JSON.parse(url.searchParams.get('data'));
    
    const headers = new Headers();
    headers.set('Authorization', oauth_data.access_token);
    headers.set('Access-Control-Allow-Origin', '*');
    
    const request_user = new Request(`${uri}.netlify/functions/api/user`, {
        method: 'GET',
        headers: headers,
    });
    
    const response_user = await fetch(request_user);
    const data_user = await response_user.json();

    let header_text = document.getElementById('user_title');
    header_text.innerText = data_user.display_name + '\'s Playlists';

    let user_icon = document.getElementById('user_icon');
    user_icon.src = data_user.images[0].url; // We need to add a check if the user does not have a profile icon
    
    function create_playlist_card(playlist) {
        var card = document.createElement('div');
        card.className = 'playlist_card';
        
        var img = document.createElement('img');
        img.className = 'playlist_cover';
        img.src = playlist.images[0].url;
        
        var title_text = document.createElement('p');
        title_text.className = 'playlist_title';
        title_text.innerText = playlist.name;

        card.appendChild(img);
        card.appendChild(title_text);

        card.addEventListener('click', async () => {
            // For now just pull and display filtered playlist json.
            // Eventually will be refactored to go somewhere else
            let playlist_url = new URL(`${uri}.netlify/functions/api/playlist/build`);
            playlist_url.searchParams.set('playlist_id', playlist.id);
            
            const playlist_request = new Request(playlist_url.toString(), {
                method: 'GET',
                headers: headers,
            })

            const response_playlist = await fetch(playlist_request);
            const data_playlist = await response_playlist.json();
            console.log(data_playlist) 
        })

        return card;
    }

    const request_playlists = new Request(`${uri}.netlify/functions/api/user/playlists`, {
        method: 'GET',
        headers: headers,
    });

    const response = await fetch(request_playlists);
    const data_playlists = await response.json();

    let playlist_container = document.getElementById('playlists_container');
    for (i = 0; i < data_playlists.items.length; i++) {
        playlist_container.appendChild(create_playlist_card(data_playlists.items[i]));
    }
});