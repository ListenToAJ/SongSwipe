$(document).ready(async function () {
    const url = new URL(window.location.href);
    const oauth_data = JSON.parse(url.searchParams.get('data'));

    const headers = new Headers();
    headers.set('Authorization', oauth_data.access_token);
    headers.set('Access-Control-Allow-Origin', '*');

    const request = new Request('http://127.0.0.1:9000/.netlify/functions/api/playlists', {
        method: 'GET',
        headers: headers,
    });

    const response = await fetch(request);
    const data = await response.json();

    let list = document.getElementById('playlistList');
    for (i = 0; i < data.items.length; i++) {
        let li = document.createElement('li');
        li.innerText = data.items[i].name;
        list.appendChild(li);
    }
});