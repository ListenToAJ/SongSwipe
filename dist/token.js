$(document).ready(async function () {
    const url = new URL(window.location.href);
    const oauth_data = JSON.parse(url.searchParams.get('data'));

    const secondsSinceEpoch = Math.floor(Date.now() / 1000);

    localStorage.setItem('refresh_token', oauth_data.refresh_token);
    localStorage.setItem('access_token', oauth_data.access_token);
    localStorage.setItem('token_expiration', secondsSinceEpoch + oauth_data.expires_in);

    window.location.href = window.location.pathname.replace('token', 'playlists');
});