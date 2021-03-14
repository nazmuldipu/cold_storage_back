const request = require("supertest");
const { Inventory } = require("../../models/inventory");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/inventory", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    server.close();
    await Inventory.remove({});
  });

  describe("POST /", () => {
    let date;
    let inventoryType;
    let vouchar_no;
    let sr_no;
    let name;
    let customer;
    let agent;
    let year;
    let quantity;

    const exec = async () => {
      return await request(server)
        .post("/api/inventory")
        .set("x-auth-token", token)
        .send({
          date,
          vouchar_no,
          sr_no,
          name,
          customer,
          agent,
          year,
          quantity,
        });
    };

    beforeEach(() => {
      date = Date.now();
      inventoryType = "RECEIVE";
      vouchar_no = 2;
      sr_no = "2/30";
      name = "Inventory1";
      customer = {
        name: "customer1",
        phone: "01912239655",
        father: "customerFather",
        address: "customerAddress",
      };
      agent = {
        name: "agent1",
        phone: "01912239656",
        father: "agentFather",
        address: "agentAddress",
      };
      year = 2021;
      quantity = 30;

      token = new User({ role: "ADMIN" }).generateAuthToken();
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
    });

    it("should return 401 if request send without auth token", async () => {
      token = "";
      const resp = await exec();
      expect(resp.status).toBe(401);
    });

    it("should return 400 if vouchar_no is invalid", async () => {
      vouchar_no = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });
  });
});
