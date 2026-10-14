
const request = require("supertest");
const app = require("../server");

describe("Task Manager API", () => {
    test("GET / returns status 200 and API message", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Task Manager API is Running...");
    });

    test("GET /unknown-route returns status 404", async () => {
        const response = await request(app).get("/unknown-route");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Route not found");
    });
});
