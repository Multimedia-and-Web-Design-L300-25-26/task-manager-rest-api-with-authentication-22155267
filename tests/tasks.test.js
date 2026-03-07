import request from "supertest";
import app, { connectDB, clearDB, disconnectDB } from "../src/app.js";

beforeAll(async () => await connectDB());
beforeEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

describe("Task Routes", () => {
  let token;
  let taskId;

  beforeEach(async () => {
    // Register and login to get a fresh token for each test
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123456"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "123456"
      });

    token = res.body.token;
  });

  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Test Description"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");

    taskId = res.body._id;
  });

  it("should get user tasks only", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should delete a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To Delete" });

    const res = await request(app)
      .delete(`/api/tasks/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});