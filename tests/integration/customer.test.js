const request = require("supertest");
const { Customer } = require("../../models/customer");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/customer", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    server.close();
    await Customer.remove({});
  });

  describe("POST /", () => {
    let name;
    let phone;
    let father;
    let address;
    let token;

    const exec = async () => {
      return await request(server)
        .post("/api/customer")
        .set("x-auth-token", token)
        .send({ name, phone, father, address });
    };

    beforeEach(() => {
      name = "Customer1";
      phone = "01912239644";
      father = "customerFather";
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

    it("should return 400 Customer with same phone provided", async () => {
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
    it("should return 200 and all customer", async () => {
      const customers = [
        {
          name: "customer1",
          phone: "01912239653",
          father: "customer1Father",
          address: "customer1Address",
        },
        {
          name: "customer2",
          phone: "01912239654",
          father: "customer2Father",
          address: "customer2Address",
        },
        {
          name: "customer3",
          phone: "01912239655",
          father: "customer3Father",
          address: "customer3Address",
        },
        {
          name: "customer4",
          phone: "01912239656",
          father: "customer4Father",
          address: "customer4Address",
        },
      ];

      await Customer.collection.insertMany(customers);

      const res = await request(server).get("/api/customer");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(4);
      expect(res.body.some((g) => g.name === "customer1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "customer2")).toBeTruthy();
      expect(res.body.some((g) => g.name === "customer3")).toBeTruthy();
      expect(res.body.some((g) => g.name === "customer4")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/customer/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/customer/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 and a customer if valid id is passed", async () => {
      const customer = new Customer({
        name: "customer1",
        phone: "01912239645",
        address: "customer1Address",
        father: "customer1Father",
      });
      await customer.save();

      const res = await request(server).get("/api/customer/" + customer._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
    });
  });

  describe("PUT /", () => {
    let id;
    let token;
    let customer;
    let name;
    let phone;
    let father;
    let address;

    const exec = async () => {
      return await request(server)
        .put(`/api/customer/${id}`)
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
        .post("/api/customer")
        .set("x-auth-token", token)
        .send({
          name: "customer1",
          phone: "01912239645",
          address: "customer1Address",
          father: "customer1Father",
        });

      customer = resp.body;
      id = customer._id;
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

    it("should return 404 if customer with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 200 if customer updated successfully", async () => {
      const res = await exec();

      const newCustomer = await Customer.findById(customer._id);

      expect(res.status).toBe(200);
      expect(newCustomer.name).toBe(name);
      expect(newCustomer.phone).toBe(phone);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let customer;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/customer/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      customer = new Customer({
        name: "customer1",
        phone: "01912239645",
        address: "customer1Address",
        father: "customer1Father",
      });
      await customer.save();

      id = customer._id;
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

    it("should return 404 if no customer with the given id was found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should delete the customer if input is valid", async () => {
      await exec();

      const customerInDb = await Customer.findById(id);

      expect(customerInDb).toBeNull();
    });

    it("should return the removed customer", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", customer._id.toHexString());
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("capacity", customer.capacity);
    });
  });
});
