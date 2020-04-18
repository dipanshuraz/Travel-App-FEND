const request = require("supertest");
const server = require("./index.js");

describe("Test the path", () => {
  test("It should response the GET method.", async () => {
    const response = await request(server).get("/test");
    expect(response.statusCode).toBe(200);
  });

  it('should get the name of a certain postal code', async () => {
    const res = await request(server).get('/geonames?zip=Liverpool');

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.text).placeName).toEqual('Liverpool');
    expect(JSON.parse(res.text).postalCode).toEqual('2170');
  });
});
