import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Atuhenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a registered user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test User",
      password: "password",
      email: "test@example.com",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "password",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an user with incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test User",
      password: "password",
      email: "test2@example.com",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test2@example.com",
      password: "12345",
    });

    expect(response.statusCode).toBe(401);
  });
});
