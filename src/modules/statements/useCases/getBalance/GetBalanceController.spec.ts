import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

let token: string;

describe("Get Balance Controller", () => {
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

  it("should be able to get the correct balance", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "Deposit statement",
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 50,
        description: "Withdraw statement",
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.balance).toBe(150);
    expect(response.body.statement[0].type).toEqual("deposit");
    expect(response.body.statement[0].amount).toBe(200);
  });

  it("should not be able to get balance without being authenticated", async () => {
    const response = await request(app).get("/api/v1/statements/balance");

    expect(response.status).toBe(401);
  });
});
