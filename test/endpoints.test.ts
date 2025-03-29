import { authCallback, authLogin, authRefresh, playlistData, userData, userPlaylists } from '../src/endpoints';
import { ERROR_RESPONSES, StatusCodes } from '../src/util';

// Default req and res schemas
const req = {
    headers: {
        authorization: ''
    },
    query: {
        code: '',
        playlist_id: '',
        refresh_token: '',
    }
}

const res = {
    status: jest.fn((x) => x),
    redirect: jest.fn((x) => x),
    json: jest.fn((x) => x),
}

// Mock api data is just some parts of the expected response from Spotify Docs copied and pasted directly
const mockUserData = {
    "country": "string",
    "display_name": "string",
}

const mockUserPlaylists = {
  "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",
  "limit": 20,
  "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",
  "offset": 0,
  "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",
  "total": 4,
}

const mockPlaylistData = {
    "name": "string",
    "collaborative": false,
    "description": "string",
    "external_urls": {
        "spotify": "string"
    },
    "followers": {
        "href": "string",
        "total": 0
    },
}

jest.mock('../src/spotify-interactions', () => ({
    fetchUserInfo: jest.fn(() => ({data: mockUserData, status: StatusCodes.OK})),
    fetchUserPlaylists: jest.fn(() => ({data: mockUserPlaylists, status: StatusCodes.OK})),
    fetchPlaylist: jest.fn(() => ({data: mockPlaylistData, status: StatusCodes.OK})),
}))

describe('authLogin endpoint tests', () => {
    test('endpoint redirects', () => {
        authLogin(req, res)
        expect(res.redirect).toHaveBeenCalled();
    });
});

describe('authCallback endpoint tests', () => {
    beforeEach(() => {
        res.redirect.mockReset();
    })


    test('endpoint redirects on status 200', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: StatusCodes.OK,
            json: jest.fn(() => {}),
        });

        await authCallback(req, res);
        expect(res.redirect).toHaveBeenCalled();
    });

    test('endpoint redirects on other status that is not 200', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: StatusCodes.BAD_REQUEST,
            json: jest.fn(() => {}),
        });

        await authCallback(req, res);
        expect(res.redirect).toHaveBeenCalled();
    });
});

describe('authRefresh endpoint tests', () => {
    beforeAll(() => {
        global.fetch = jest.fn().mockResolvedValue({
            status: StatusCodes.OK,
            json: jest.fn(() => ({access_token: '120X'}))
        });
    })
    
    beforeEach(() => {
        res.status.mockReset();
        res.json.mockReset();
    })

    test('correct status and response when refresh token is provided', async () => {
        let req = { 'query': {'refresh_token': '12345'} };

        await authRefresh(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(res.json).toHaveBeenCalledWith({access_token: '120X'});
    });

    test('correct status and response when no refresh token is provided', async () => {
        await authRefresh(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(ERROR_RESPONSES.INVALID_TOKEN);
    });

    test('correct status and response if there is an issue with the fetch', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: StatusCodes.BAD_REQUEST,
            json: jest.fn(() => ({access_token: '120X'})),
        });

        let req = { 'query': {'refresh_token': '12345'} };

        await authRefresh(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(ERROR_RESPONSES.REFRESH_ERROR);
    });
});

describe('userData endpoint tests', () => {    
    beforeEach(() => {
        res.status.mockReset();
        res.json.mockReset();
    })


    test('correct status and response when auth code is provided', async () => {
        let req = { 'headers': {'authorization': 'test'} };

        await userData(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(res.json).toHaveBeenCalledWith(mockUserData);
    });

    test('correct status and response when no auth code is provided', async () => {
        await userData(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(ERROR_RESPONSES.NO_AUTH);
    });
});

describe('userPlaylists endpoint tests', () => {
    beforeEach(() => {
        res.status.mockReset();
        res.json.mockReset();
    })


    test('correct status and response when auth code is provided', async () => {
        let req = { 'headers': {'authorization': 'test'} };

        await userPlaylists(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(res.json).toHaveBeenCalledWith(mockUserPlaylists);
    });

    test('correct status and response when no auth code is provided', async () => {
        await userPlaylists(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(ERROR_RESPONSES.NO_AUTH);
    });
});

describe('playlistData endpoint tests', () => {
    beforeEach(() => {
        res.status.mockReset();
        res.json.mockReset();
    })

    test('correct status and response when auth code and playlist id is provided', async () => {
        let req = { 'headers': {'authorization': 'test'}, 'query': {'playlist_id': '12345'} };

        await playlistData(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(res.json).toHaveBeenCalledWith(mockPlaylistData);
    });

    test('correct status and response when no auth code or playlist id is provided', async () => {
        await playlistData(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(ERROR_RESPONSES.NO_AUTH_OR_PARAM);
    });

    test('correct status and response when no auth code is provided but playlist is', async () => {
        let req = { 'headers': {'authorization': ''}, 'query': {'playlist_id': '12345'} };

        await playlistData(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(ERROR_RESPONSES.NO_AUTH_OR_PARAM);
    });

    test('correct status and response when no playlist id is provided but auth code is', async () => {
        let req = { 'headers': {'authorization': ''}, 'query': {'playlist_id': ''} };

        await playlistData(req, res);
        expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(ERROR_RESPONSES.NO_AUTH_OR_PARAM);
    });
});