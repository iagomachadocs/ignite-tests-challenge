import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Test User",
      password: "password",
      email: "test@example.com",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should not be able to create a new user with an email already registered", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test User 2",
      password: "1234",
      email: "test2@example.com",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "Test User 3",
      password: "4321",
      email: "test2@example.com",
    });

    expect(response.statusCode).toBe(400);
  });
});
