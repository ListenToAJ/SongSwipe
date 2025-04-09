import express, { Router } from 'express'
import serverless from 'serverless-http'
import cors from 'cors';
import { authCallback, authLogin, authRefresh, playlistBuild, playlistData, userData, userPlaylists, songPreview, songRemove, playlistCreate, songAdd } from './endpoints';

const app = express();
const router = Router();

app.use(cors());
app.use(express.json());

// Define GET routes
// Authorization endpoints
router.get('/auth/login', authLogin);
router.get('/auth/callback', authCallback);
router.get('/auth/refresh', authRefresh);
// Spotify User endpoints
router.get('/user', userData);
router.get('/user/playlists', userPlaylists);
// Spotify Playlist endpoints
router.get('/playlist', playlistData);
router.get('/playlist/build', playlistBuild);
router.post('/playlist/create', playlistCreate);
router.post('/playlist/add', songAdd);
router.delete('/playlist/remove', songRemove);
// Song related endpoints
router.get('/song', songPreview);

// Netlify API setup
app.use("/.netlify/functions/api", router);

export const handler = serverless(app);