import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

let token: string;

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get statement operation information", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "Deposit statement",
      });

    const statementId = depositResponse.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.description).toEqual("Deposit statement");
    expect(response.body.amount).toEqual("200.00");
    expect(response.body.type).toEqual("deposit");
  });
});
