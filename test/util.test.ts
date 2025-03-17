import { generateRandomString } from "../src/util";

describe('util module tests', () => {
    test('test length (6)', () => {
        expect(generateRandomString(6).length).toBe(6);
    });
    test('test length (8)', () => {
        expect(generateRandomString(8).length).toBe(8);
    });
});