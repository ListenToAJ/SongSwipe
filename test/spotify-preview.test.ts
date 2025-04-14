import { getSpotifyPreviewUrl } from "../src/spotify-preview";
import { StatusCodes } from "../src/util";


describe('spotify preview tests', () => {
    global.fetch = jest.fn().mockResolvedValue({
                status: StatusCodes.OK,
                text: jest.fn(() => ""),
            });

    test('make sure spotify preview url fetches data', async () => {
        await getSpotifyPreviewUrl("");
        expect(global.fetch).toHaveBeenCalled();
    });
});