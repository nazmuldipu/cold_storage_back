const request = require("supertest");
const { Inventory } = require("../../models/inventory");
const { User } = require("../../models/user");
const { Customer } = require("../../models/customer");
const { Ledger } = require("../../models/ledger");
const { Agent } = require("../../models/agent");
const mongoose = require("mongoose");
let server;

describe("/api/ledger", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    server.close();
    await Ledger.remove({});
    await Inventory.remove({});
    await Customer.remove({});
    await Agent.remove({});
  });

  describe("POST /", () => {
    let token;

    let sr_no;
    let year;
    let customer;
    let agent;

    let loan_amount;
    let loan_rate;
    let loan_profit;
    let loan_payable;

    let quantity;
    let rate;
    let service_amount;

    let emptyBag_quantity;
    let emptyBag_rate;
    let emptyBag_amount;
    let total_amount;

    const exec = async () => {
      return await request(server)
        .post("/api/ledger")
        .set("x-auth-token", token)
        .send({
          sr_no,
          year,
          customer,
          agent,

          loan_amount,
          loan_rate,
          loan_profit,
          loan_payable,

          quantity,
          rate,
          service_amount,

          emptyBag_quantity,
          emptyBag_rate,
          emptyBag_amount,

          total_amount,
        });
    };

    beforeEach(async () => {
      sr_no = "1/60";
      year = 2021;
      quantity = 40;
      rate = 250;
      service_amount = 10000;
      customer = {
        name: "customer2",
        phone: "01912239651",
        father: "customer2Father",
        address: "customer2Address",
      };
      agent = {
        name: "agent1",
        phone: "01912239656",
        father: "agentFather",
        address: "agentAddress",
      };
      loan_amount = 20000;
      loan_rate = 12;
      loan_profit = 2400;
      loan_payable = 22400;

      emptyBag_quantity = 70;
      emptyBag_rate = 78;
      emptyBag_amount = 5460;

      total_amount = 37860;

      dbAgent = new Agent(agent);
      await dbAgent.save();

      dbInventory = new Inventory({
        date: "Sun Mar 14 2021 21:06:11 GMT+0600",
        vouchar_no: 1,
        sr_no,
        name: "Inventory1",
        customer,
        agent,
        year,
        quantity,
      });
      await dbInventory.save();

      token = new User({ role: "ADMIN" }).generateAuthToken();
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("sr_no", sr_no);
      expect(res.body).toHaveProperty("year", year);
      expect(res.body).toHaveProperty("loan_amount", loan_amount);
      expect(res.body).toHaveProperty("loan_rate", loan_rate);
      expect(res.body).toHaveProperty("loan_profit", loan_profit);
      expect(res.body).toHaveProperty("loan_payable", loan_payable);
      expect(res.body).toHaveProperty("service_amount", service_amount);
      expect(res.body).toHaveProperty("emptyBag_amount", emptyBag_amount);
      expect(res.body).toHaveProperty("total_amount", total_amount);
    });

    it("should return 200 if agent is null", async () => {
      agent = null;
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("total_amount", total_amount);
    });

    it("should return 400 if customer is null", async () => {
      customer = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if sr_no is null", async () => {
      sr_no = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if year is null", async () => {
      year = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should return 400 if loan_amount is null", async () => {
      loan_amount = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should return 400 if loan_rate is null", async () => {
      loan_rate = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should return 400 if quantity is null", async () => {
      quantity = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should return 400 if rate is null", async () => {
      rate = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should return 400 if emptyBag_quantity is null", async () => {
      emptyBag_quantity = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should return 400 if emptyBag_rate is null", async () => {
      emptyBag_rate = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should return 401 if request send without auth token", async () => {
      token = "";
      const resp = await exec();
      expect(resp.status).toBe(401);
    });
  });

  describe("GET /", () => {
    it("should return 200 and all ledgers", async () => {
      const ledgers = [
        {
          sr_no: "1/16",
          year: 2021,
          customer: {
            phone: "01734163417",
            address: "দইখাওয়া",
            name: "শ্রী রতন চন্দ্র",
            father: "ননী গোপাল চন্দ্র",
          },
          quantity: 40,
          rate: 250,
          service_amount: 10000,
          loan_amount: 20000,
          loan_rate: 12,
          loan_profit: 2400,
          loan_payable: 22400,
          emptyBag_quantity: 70,
          emptyBag_rate: 78,
          emptyBag_amount: 5460,
        },
        {
          sr_no: "2/16",
          year: 2021,
          customer: {
            phone: "01734163417",
            address: "দইখাওয়া",
            name: "শ্রী রতন চন্দ্র",
            father: "ননী গোপাল চন্দ্র",
          },
          quantity: 40,
          rate: 250,
          service_amount: 10000,
          loan_amount: 20000,
          loan_rate: 12,
          loan_profit: 2400,
          loan_payable: 22400,
          emptyBag_quantity: 70,
          emptyBag_rate: 78,
          emptyBag_amount: 5460,
        },
      ];

      await Ledger.collection.insertMany(ledgers);

      let token = new User({ role: "USER" }).generateAuthToken();
      const res = await request(server)
        .get("/api/ledger")
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(2);
      expect(res.body.docs.some((g) => g.sr_no == "1/16")).toBeTruthy();
      expect(res.body.docs.some((g) => g.sr_no == "2/16")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/ledger/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no agent with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/ledger/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 and a agent if valid id is passed", async () => {
      const led = new Ledger({
        sr_no: "1/16",
        year: 2021,
        customer: {
          phone: "01734163417",
          address: "দইখাওয়া",
          name: "শ্রী রতন চন্দ্র",
          father: "ননী গোপাল চন্দ্র",
        },
        quantity: 40,
        rate: 250,
        service_amount: 10000,
        loan_amount: 20000,
        loan_rate: 12,
        loan_profit: 2400,
        loan_payable: 22400,
        emptyBag_quantity: 70,
        emptyBag_rate: 78,
        emptyBag_amount: 5460,
      });
      await led.save();

      const res = await request(server).get("/api/ledger/" + led._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("sr_no", led.sr_no);
    });
  });

  describe("PUT /", () => {
    let id;
    let token;
    let ledger;

    let sr_no;
    let year;
    let customer;
    let agent;

    let loan_amount;
    let loan_rate;
    let loan_profit;
    let loan_payable;

    let quantity;
    let rate;
    let service_amount;

    let emptyBag_quantity;
    let emptyBag_rate;
    let emptyBag_amount;
    let total_amount;

    const exec = async () => {
      return await request(server)
        .put("/api/ledger/" + id)
        .set("x-auth-token", token)
        .send({
          sr_no,
          year,
          customer,
          agent,

          loan_amount,
          loan_rate,
          loan_profit,
          loan_payable,

          quantity,
          rate,
          service_amount,

          emptyBag_quantity,
          emptyBag_rate,
          emptyBag_amount,

          total_amount,
        });
    };

    beforeEach(async () => {
      token = new User({ role: "ADMIN" }).generateAuthToken();

      sr_no = "1/60";
      year = 2021;
      quantity = 40;
      rate = 250;
      service_amount = 10000;
      customer = {
        name: "customer2",
        phone: "01912239651",
        father: "customer2Father",
        address: "customer2Address",
      };
      agent = {
        name: "agent1",
        phone: "01912239656",
        father: "agentFather",
        address: "agentAddress",
      };
      loan_amount = 20000;
      loan_rate = 12;
      loan_profit = 2400;
      loan_payable = 22400;

      emptyBag_quantity = 70;
      emptyBag_rate = 78;
      emptyBag_amount = 5460;

      total_amount = 37860;

      dbAgent = new Agent(agent);
      await dbAgent.save();

      dbInventory = new Inventory({
        date: "Sun Mar 14 2021 21:06:11 GMT+0600",
        vouchar_no: 1,
        sr_no,
        name: "Inventory1",
        customer,
        agent,
        year,
        quantity,
      });
      await dbInventory.save();

      const resp = await request(server)
        .post("/api/ledger")
        .set("x-auth-token", token)
        .send({
          sr_no,
          year: 2021,
          customer: {
            phone: "01734163417",
            address: "দইখাওয়া",
            name: "শ্রী রতন চন্দ্র",
            father: "ননী গোপাল চন্দ্র",
          },
          agent,
          quantity: 40,
          rate: 250,
          service_amount: 10000,
          loan_amount: 20000,
          loan_rate: 12,
          loan_profit: 2400,
          loan_payable: 22400,
          emptyBag_quantity: 70,
          emptyBag_rate: 78,
          emptyBag_amount: 5460,
        });

      ledger = resp.body;
      id = ledger._id;
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

    it("should return 404 if no ledger with the given id exists", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
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

    it("should return 200 if ledger updated successfully", async () => {
      const res = await exec();
      const newLedger = await Ledger.findById(ledger._id);

      expect(res.status).toBe(200);
      expect(newLedger.sr_no).toBe(sr_no);
      expect(newLedger.customer.name).toBe(customer.name);
      expect(newLedger.customer.father).toBe(customer.father);
      expect(newLedger.quantity).toBe(quantity);
      expect(newLedger.year).toBe(year);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let ledger;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/ledger/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      ledger = new Ledger({
        sr_no: "1/16",
        year: 2021,
        customer: {
          phone: "01734163417",
          address: "দইখাওয়া",
          name: "শ্রী রতন চন্দ্র",
          father: "ননী গোপাল চন্দ্র",
        },
        quantity: 40,
        rate: 250,
        service_amount: 10000,
        loan_amount: 20000,
        loan_rate: 12,
        loan_profit: 2400,
        loan_payable: 22400,
        emptyBag_quantity: 70,
        emptyBag_rate: 78,
        emptyBag_amount: 5460,
      });
      await ledger.save();

      id = ledger._id;
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

    it("should return 404 if no ledger with the given id was found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the ledger if input is valid", async () => {
      await exec();

      const ledgerDb = await Ledger.findById(id);

      expect(ledgerDb).toBeNull();
    });

    it("should return the removed ledger", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", ledger._id.toHexString());
      expect(res.body).toHaveProperty("sr_no", ledger.sr_no);
      expect(res.body).toHaveProperty("quantity", ledger.quantity);
    });
  });
});
