import { createRequest, HttpMethod } from '../src/spotify-interactions';

describe('createRequest tests', () => {
    test('correct base url', () => {
        const request = createRequest('', '', HttpMethod.GET);
        expect(request.url).toBe('https://api.spotify.com/v1');
    });
    test('correct endpoint added', () => {
        const request = createRequest('/test', '', HttpMethod.GET);
        expect(request.url).toBe('https://api.spotify.com/v1/test');
    });
    test('auth header is set properly', () => {
        const request = createRequest('/test', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', HttpMethod.GET);
        expect(request.headers.get('Authorization')).toBe('Bearer ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });
    test.each([
        [HttpMethod.GET, 'GET'],
        [HttpMethod.POST, 'POST'],
        [HttpMethod.PUT, 'PUT'],
        [HttpMethod.PATCH, 'PATCH'],
        [HttpMethod.DELETE, 'DELETE'],
    ])('test http method is set properly', (input, expected) => {
        const request = createRequest('', '', input);
        expect(request.method).toBe(expected);
    });
});