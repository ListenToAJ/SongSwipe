import express, { Router } from 'express'
import serverless from 'serverless-http'
import cors from 'cors';
import { authCallback, authLogin, authRefresh, playlistBuild, playlistData, userData, userPlaylists, songPreview } from './endpoints';

const app = express();
const router = Router();

app.use(cors());

// Define GET routes
// Authorize Routes
router.get('/auth/login', authLogin);
router.get('/auth/callback', authCallback);
router.get('/auth/refresh', authRefresh);
// Spotify User stuff
router.get('/user', userData);
router.get('/user/playlists', userPlaylists);
router.get('/playlist', playlistData);
router.get('/playlist/build', playlistBuild);
// Preview Stuff
router.get('/song', songPreview);

// Netlify API stuff
app.use("/.netlify/functions/api", router);

export const handler = serverless(app);