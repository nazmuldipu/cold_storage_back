const request = require("supertest");
const { Agent } = require("../../models/agent");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/agent", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    server.close();
    await Agent.remove({});
  });

  describe("POST /", () => {
    let name;
    let phone;
    let father;
    let address;
    let token;

    const exec = async () => {
      return await request(server)
        .post("/api/agent")
        .set("x-auth-token", token)
        .send({ name, phone, father, address });
    };

    beforeEach(() => {
      name = "Agent1";
      phone = "01912239644";
      father = "agentFather";
      address = "Zalkuri";

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

    it("should return 400 if phone is null than 0", async () => {
      phone = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if phone patern is invalid than 0", async () => {
      phone = "01556";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if father is null than 0", async () => {
      father = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 Agent with same phone provided", async () => {
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
    it("should return 200 and all agent", async () => {
      const agents = [
        {
          name: "agent1",
          phone: "01912239653",
          father: "agent1Father",
          address: "agent1Address",
        },
        {
          name: "agent2",
          phone: "01912239654",
          father: "agent2Father",
          address: "agent2Address",
        },
        {
          name: "agent3",
          phone: "01912239655",
          father: "agent3Father",
          address: "agent3Address",
        },
        {
          name: "agent4",
          phone: "01912239656",
          father: "agent4Father",
          address: "agent4Address",
        },
      ];

      await Agent.collection.insertMany(agents);

      const res = await request(server).get("/api/agent");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(4);
      expect(res.body.some((g) => g.name === "agent1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "agent2")).toBeTruthy();
      expect(res.body.some((g) => g.name === "agent3")).toBeTruthy();
      expect(res.body.some((g) => g.name === "agent4")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/agent/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no agent with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/agent/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 and a agent if valid id is passed", async () => {
      const agent = new Agent({
        name: "agent1",
        phone: "01912239645",
        address: "agent1Address",
        father: "agent1Father",
      });
      await agent.save();

      const res = await request(server).get("/api/agent/" + agent._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", agent.name);
    });
  });

  describe("PUT /", () => {
    let id;
    let token;
    let agent;
    let name;
    let phone;
    let father;
    let address;

    const exec = async () => {
      return await request(server)
        .put(`/api/agent/${id}`)
        .set("x-auth-token", token)
        .send({ name, phone, father, address });
    };

    beforeEach(async () => {
      token = new User({ role: "ADMIN" }).generateAuthToken();

      name = "updatedName";
      phone = "01912239645";
      address = "newAddress";
      father = "updatedFather";

      const resp = await request(server)
        .post("/api/agent")
        .set("x-auth-token", token)
        .send({
          name: "agent1",
          phone: "01912239645",
          address: "agent1Address",
          father: "agent1Father",
        });

      agent = resp.body;
      id = agent._id;
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

    it("should return 400 if phone is null", async () => {
      phone = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if phone is not valid", async () => {
      phone = "01955";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if father is null", async () => {
      father = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if agent with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 200 if agent updated successfully", async () => {
      const res = await exec();

      const newAgent = await Agent.findById(agent._id);

      expect(res.status).toBe(200);
      expect(newAgent.name).toBe(name);
      expect(newAgent.phone).toBe(phone);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let agent;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/agent/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      agent = new Agent({
        name: "agent1",
        phone: "01912239645",
        address: "agent1Address",
        father: "agent1Father",
      });
      await agent.save();

      id = agent._id;
      token = new User({ role: "ADMIN" }).generateAuthToken();
    });

    it("should return 401 if user is not logged in", async () => {
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

    it("should return 404 if no agent with the given id was found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the agent if input is valid", async () => {
      await exec();

      const agentInDb = await Agent.findById(id);

      expect(agentInDb).toBeNull();
    });

    it("should return the removed agent", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", agent._id.toHexString());
      expect(res.body).toHaveProperty("name", agent.name);
      expect(res.body).toHaveProperty("capacity", agent.capacity);
    });
  });
});
