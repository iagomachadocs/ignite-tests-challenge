import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test User",
      password: "password",
      email: "test@example.com",
    });

    const sessionResponse = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "password",
    });

    const auth = sessionResponse.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${auth.token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toEqual("Test User");
  });

  it("should not be able to get user profile without being logged in", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.statusCode).toBe(401);
  });
});
