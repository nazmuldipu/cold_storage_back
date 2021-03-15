const request = require("supertest");
const { Inventory } = require("../../models/inventory");
const { User } = require("../../models/user");
const { Customer } = require("../../models/customer");
const { Agent } = require("../../models/agent");
const mongoose = require("mongoose");
const { required } = require("joi");
let server;

describe("/api/inventory", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    server.close();
    await Inventory.remove({});
    await Customer.remove({});
    await Agent.remove({});
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

    beforeEach(async () => {
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

      //Previously load agent info into database
      dbAgent = new Agent(agent);
      await dbAgent.save();

      token = new User({ role: "ADMIN" }).generateAuthToken();
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
    });

    it("should return 200 if agent is null", async () => {
      agent = null;
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
    });

    it("should return 200 if agent is null then customer info should be saved on database", async () => {
      agent = null;
      const res = await exec();
      expect(res.status).toBe(200);
      const cus = res.body["customer"];
      const newCustomer = await Customer.findById(cus._id);
      expect(newCustomer).not.toBeNull();
      expect(res.body).toHaveProperty("name", name);
      expect(newCustomer).toHaveProperty("name", customer.name);
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

  describe("GET /", () => {
    it("should return 200 and all inventory", async () => {
      const inventories = [
        {
          date: "Sun Mar 14 2021 21:06:11 GMT+0600",
          vouchar_no: 15,
          sr_no: "15/30",
          name: "Inventory1",
          customer: {
            name: "customer2",
            phone: "01912239653",
            father: "customer2Father",
            address: "customer2Address",
          },
          agent: null,
          year: 2021,
          quantity: 30,
        },
        {
          date: "Sun Mar 14 2021 21:06:11 GMT+0600",
          vouchar_no: 16,
          sr_no: "16/40",
          name: "Inventory1",
          customer: {
            name: "customer2",
            phone: "01912239653",
            father: "customer2Father",
            address: "customer2Address",
          },
          agent: null,
          year: 2021,
          quantity: 40,
        },
      ];

      await Inventory.collection.insertMany(inventories);

      const res = await request(server).get("/api/inventory");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.vouchar_no == 16)).toBeTruthy();
      expect(res.body.some((g) => g.vouchar_no == 15)).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/inventory/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no agent with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/inventory/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 and a agent if valid id is passed", async () => {
      const inv = new Inventory({
        date: "Sun Mar 14 2021 21:06:11 GMT+0600",
        vouchar_no: 15,
        sr_no: "15/30",
        name: "Inventory1",
        customer: {
          name: "customer2",
          phone: "01912239653",
          father: "customer2Father",
          address: "customer2Address",
        },
        agent: null,
        year: 2021,
        quantity: 30,
      });
      await inv.save();

      const res = await request(server).get("/api/inventory/" + inv._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("sr_no", inv.sr_no);
    });
  });

  describe("PUT /", () => {
    let id;
    let inventory;
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
        .put(`/api/inventory/${id}`)
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

    beforeEach(async () => {
      token = new User({ role: "ADMIN" }).generateAuthToken();

      date = Date.now();
      inventoryType = "RECEIVE";
      vouchar_no = 2;
      sr_no = "2/30";
      name = "InventoryNew";
      customer = {
        name: "customerNew",
        phone: "01912239656",
        father: "customerNewFather",
        address: "customerNewAddress",
      };
      agent = {
        name: "agentNew",
        phone: "01912239655",
        father: "agentNewFather",
        address: "agentNewAddress",
      };
      year = 2022;
      quantity = 50;

      //Previously load agent info into database
      dbAgent = new Agent(agent);
      await dbAgent.save();

      const resp = await request(server)
        .post("/api/inventory")
        .set("x-auth-token", token)
        .send({
          date: "Sun Mar 14 2021 21:06:11 GMT+0600",
          vouchar_no: 1,
          sr_no: "1/60",
          name: "Inventory1",
          customer: {
            name: "customer2",
            phone: "01912239651",
            father: "customer2Father",
            address: "customer2Address",
          },
          agent,
          year: 2021,
          quantity: 40,
        });
      inventory = resp.body;
      id = inventory._id;
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

    it("should return 404 if invalid id is passed", async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if no inventory with the given id exists", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 400 if vouchar_no is invalid", async () => {
      vouchar_no = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if sr_no is invalid", async () => {
      sr_no = "";
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if customer is null", async () => {
      customer = null;
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if quantity is null", async () => {
      quantity = null;
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 400 if year is null", async () => {
      year = null;
      const resp = await exec();
      expect(resp.status).toBe(400);
    });

    it("should return 200 if agent is null", async () => {
      agent = null;
      const resp = await exec();
      expect(resp.status).toBe(200);
    });

    it("should return 200 if inventory updated successfully", async () => {
      const res = await exec();

      const newIventory = await Inventory.findById(inventory._id);

      expect(res.status).toBe(200);
      expect(newIventory.vouchar_no).not.toBe(vouchar_no); //vouchar_no should not change
      expect(newIventory.vouchar_no).toBe(1);
      expect(newIventory.sr_no).toBe(sr_no);
      expect(newIventory.customer.name).toBe(customer.name);
      expect(newIventory.customer.father).toBe(customer.father);
      expect(newIventory.quantity).toBe(quantity);
      expect(newIventory.year).toBe(year);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let inventory;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/inventory/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      inventory = new Inventory({
        date: "Sun Mar 14 2021 21:06:11 GMT+0600",
        vouchar_no: 1,
        sr_no: "1/60",
        name: "Inventory1",
        customer: {
          name: "customer2",
          phone: "01912239651",
          father: "customer2Father",
          address: "customer2Address",
        },
        agent: {
          name: "agentNew",
          phone: "01912239655",
          father: "agentNewFather",
          address: "agentNewAddress",
        },
        year: 2021,
        quantity: 40,
      });
      await inventory.save();

      id = inventory._id;
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

    it("should return 404 if no inventory with the given id was found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the inventory if input is valid", async () => {
      await exec();

      const inventoryInDb = await Inventory.findById(id);

      expect(inventoryInDb).toBeNull();
    });

    it("should return the removed inventory", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", inventory._id.toHexString());
      expect(res.body).toHaveProperty("sr_no", inventory.sr_no);
      expect(res.body).toHaveProperty("quantity", inventory.quantity);
    });
  });
});
