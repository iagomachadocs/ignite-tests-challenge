import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

let token: string;

let receiver_id: string;

describe("Create Transfer Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "Sender User",
      password: "password",
      email: "sender@example.com",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "sender@example.com",
      password: "password",
    });

    token = response.body.token;

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "Deposit statement",
      });

    const resp = await request(app).post("/api/v1/users").send({
      name: "Receiver User",
      password: "password",
      email: "receiver@example.com",
    });

    receiver_id = resp.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a transfer between users", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: "Transfer",
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a transfer between users with insufficient funds", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 1000,
        description: "Transfer",
      });

    expect(response.status).toBe(400);
  });
});
