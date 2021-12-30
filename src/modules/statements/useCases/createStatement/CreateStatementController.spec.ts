import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

let token: string;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "Test User",
      password: "password",
      email: "test@example.com",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "password",
    });

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "Deposit statement",
      });

    expect(response.status).toBe(201);
  });

  it("should be able to create a withdraw statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "Deposit statement",
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "Withdraw statement",
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a withdraw statement without funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Test User 2",
      password: "password",
      email: "test2@example.com",
    });

    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test2@example.com",
      password: "password",
    });

    const { token } = body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 300,
        description: "Withdraw statement",
      });

    expect(response.status).toBe(400);
  });

  it("should not be able to create a withdraw statement without being authenticated", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer testToken`,
      })
      .send({
        amount: 300,
        description: "Withdraw statement",
      });

    expect(response.status).toBe(401);
  });
});
