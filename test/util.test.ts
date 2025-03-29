import { generateRandomString } from "../src/util";

describe('generateRandomString tests', () => {
    test.each([
        [0, 0],
        [1, 1],
        [2, 2],
        [6, 6],
        [8, 8],
        [10, 10],
        [100, 100],
        [1000, 1000]
    ])('test length of random string', (input, expected) => {
        expect(generateRandomString(input).length).toBe(expected);
    });
});