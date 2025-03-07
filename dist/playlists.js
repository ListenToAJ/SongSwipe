$(document).ready(async function () {
    const uri = 'http://10.248.19.22:9000/' // TODO: we need to put the uri on something

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
    user_icon.src = data_user.images[0].url;
    
    function create_playlist_card(title, img_url) {
        var card = document.createElement('div');
        card.className = 'playlist_card';
        
        var img = document.createElement('img');
        img.className = 'playlist_cover';
        img.src = img_url;
        
        var title_text = document.createElement('p');
        title_text.className = 'playlist_title';
        title_text.innerText = title;

        card.appendChild(img);
        card.appendChild(title_text);
        return card;
    }

    const request_playlists = new Request(`${uri}.netlify/functions/api/playlists`, {
        method: 'GET',
        headers: headers,
    });

    const response = await fetch(request_playlists);
    const data_playlists = await response.json();

    let playlist_container = document.getElementById('playlists_container');
    for (i = 0; i < data_playlists.items.length; i++) {
        playlist_container.appendChild(create_playlist_card(data_playlists.items[i].name, data_playlists.items[i].images[0].url));
    }
});