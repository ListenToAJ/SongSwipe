import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import dotenv from 'dotenv';
import { getSpotifyPreviewUrl } from './spotify-preview.ts';

dotenv.config();

(async () => {
    const sdk = SpotifyApi.withClientCredentials(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
    
    const items = await sdk.search("kiseki (peak goat raw fire)", ["playlist"]);
    const my_playlist = items.playlists.items[0];

    const tracks = await sdk.playlists.getPlaylistItems(my_playlist.id);
    console.log(tracks.items.length);
    console.log(tracks.items.map((item) => item.track.name));

    const preview_url = await getSpotifyPreviewUrl(tracks.items[0].track.id);
    console.log(preview_url);
})();
