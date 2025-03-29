import express, { Router } from 'express'
import serverless from 'serverless-http'
import cors from 'cors';
import { authCallback, authLogin, authRefresh, playlistBuild, playlistData, userData, userPlaylists } from './endpoints';

const app = express();
const router = Router();

app.use(cors());

// Define GET routes
router.get('/auth/login', authLogin);
router.get('/auth/callback', authCallback);
router.get('/auth/refresh', authRefresh);
router.get('/user', userData);
router.get('/user/playlists', userPlaylists);
router.get('/playlist', playlistData);
router.get('/playlist/build', playlistBuild);

app.use("/.netlify/functions/api", router);

export const handler = serverless(app);