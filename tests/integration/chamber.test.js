const request = require("supertest");
const { Chamber } = require("../../models/chamber");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/chamber", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    server.close();
    await Chamber.remove({});
  });

  describe("POST /", () => {
    let name;
    let capacity;
    let token;

    const exec = async () => {
      return await request(server)
        .post("/api/chamber")
        .set("x-auth-token", token)
        .send({ name, capacity });
    };

    beforeEach(() => {
      name = "Chamber1";
      capacity = 50;

      token = new User({ role: "ADMIN" }).generateAuthToken();
    });

    it("should return 401 if request send without auth token", async () => {
      token = "";
      const resp = await exec();
      expect(resp.status).toBe(401);
    });

    it("should return 400 if name is invalid", async () => {
      name = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if name is less than 3 character", async () => {
      name = "br";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if name is greaterthan 50 character", async () => {
      name = new Array(52).join("a");
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if capacity is less than 0", async () => {
      capacity = -1;
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 Chamber with same name provided", async () => {
      const res = await exec();
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("GET /", () => {
    it("should return 200 and all chamber", async () => {
      const chmabers = [
        { name: "chmaber1", capacity: 10 },
        { name: "chmaber2", capacity: 20 },
      ];

      await Chamber.collection.insertMany(chmabers);

      const res = await request(server).get("/api/chamber");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "chmaber1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "chmaber2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/chamber/1");

      expect(res.status).toBe(404);
    });

    it("should return 404 if no chamber with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/chamber/" + id);

      expect(res.status).toBe(404);
    });

    it("should return 200 and a chamber if valid id is passed", async () => {
      const chamber = new Chamber({ name: "chamber1", capacity: 20 });
      await chamber.save();

      const res = await request(server).get("/api/chamber/" + chamber._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", chamber.name);
    });
  });

  describe("PUT /", () => {
    let id;
    let token;
    let chamber;
    let name;
    let capacity;

    const exec = async () => {
      return await request(server)
        .put(`/api/chamber/${id}`)
        .set("x-auth-token", token)
        .send({ name, capacity });
    };

    beforeEach(async () => {
      token = new User({ role: "ADMIN" }).generateAuthToken();

      name = "updatedName";
      capacity = 25;

      const exec = await request(server)
        .post("/api/chamber")
        .set("x-auth-token", token)
        .send({ name: "chamber1", capacity: 30 });

      chamber = exec.body;
      id = chamber._id;
    });

    it("should return 401 if no token is provided", async () => {
      token = "";
      const resp = await exec();
      expect(resp.status).toBe(401);
    });

    it("should return 403 if requested user is not admin", async () => {
      token = new User().generateAuthToken();
      const resp = await exec();
      expect(resp.status).toBe(403);
    });

    it("should return 400 if name is invalid", async () => {
      name = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if name is less than 3 character", async () => {
      name = "br";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if name is greaterthan 50 character", async () => {
      name = new Array(52).join("a");
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if priority is less than 0", async () => {
      capacity = -1;
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if chamber with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 200 if chamber updated successfully", async () => {
      const res = await exec();

      const newChamber = await Chamber.findById(chamber._id);

      expect(res.status).toBe(200);
      expect(newChamber.name).toBe(name);
      expect(newChamber.capacity).toBe(capacity);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let chamber;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/chamber/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      chamber = new Chamber({ name: "chamber1", capacity: 50 });
      await chamber.save();

      id = chamber._id;
      token = new User({ role: "ADMIN" }).generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      token = new User({ role: "USER" }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no chamber with the given id was found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the chamber if input is valid", async () => {
      await exec();

      const chamberInDb = await Chamber.findById(id);

      expect(chamberInDb).toBeNull();
    });

    it("should return the removed chamber", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", chamber._id.toHexString());
      expect(res.body).toHaveProperty("name", chamber.name);
      expect(res.body).toHaveProperty("capacity", chamber.capacity);
    });
  });
});
