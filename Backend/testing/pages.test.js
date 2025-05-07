// const mongoose = require('mongoose')
// const app = require('../app')
// const userModel = require('../models/user')
// const request = require('supertest')

// require('dotenv').config()
// const { MongoMemoryServer } = require('mongodb-memory-server');

// let mongoServer;

// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//     await mongoose.connect(uri);
// });

// beforeEach(async () => {
//     await mongoose.connect(process.env.connect_DB)
// })

// afterAll(async () => {
//     await userModel.deleteMany({ isTest: true });
//     await mongoose.connection.close();
// })

// describe('navigate to login page', () => {
//     it('should navigate to login page', async () => {
//         const res = await request(app).get('/login');
//         expect(res.status).toBe(200);
//     })
// })

// describe('navigate to registration page', () => {
//     it('should navigate to registration page', async () => {
//         const res = await request(app).get('/register');
//         expect(res.status).toBe(200);
//     })
// })

// describe('navigation of admin and normal users', () => {
//     let agent;
//     beforeAll(() => {
//         agent = request.agent(app);
//     })
//     it('should navigate to discount manager page if the user is admin', async () => {
//         await agent
//             .post('/register')
//             .send({
//                 firstName: "Admin",
//                 lastName: "Test",
//                 mobile: "01000000000",
//                 gender: "male",
//                 username: "adminUser",
//                 email: "admin@test.com",
//                 password: "password123",
//                 confirmPassword: "password123",
//                 isAdmin: true,
//                 isTest: true
//             });
//             const res = await agent.get('/home');
//             expect(res.header['location']).toBe('/discount')
//             const discountRes = await agent.get('/discount')
//             expect(discountRes.status).toBe(200)
//     }),
//     it('should navigate to the home page if the user is normal user', async() => {
//         await agent
//             .post('/register')
//             .send({
//                 firstName: "Normal",
//                 lastName: "User",
//                 mobile: "01000000000",
//                 gender: "male",
//                 username: "normalUser",
//                 email: "normalUser@test.com",
//                 password: "password123",
//                 confirmPassword: "password123",
//                 isAdmin: false,
//                 isTest: true
//             });
//         const res = await agent.get('/discount');
//         expect(res.header['location']).toBe('/home');
//     }),
//     it('should navigate normally to the home page', async() => {
//         const res = await agent.get('/home');
//         expect(res.status).toBe(200);
//     }),
//     it('should fail to load the products in the home page.', async () => {
//         await mongoose.connection.close();
//         const res = await agent.get('/home');
//         expect(res.status).toBe(500);
//         await mongoose.connect(process.env.connect_DB);
//     }),
//     it('should redirect to the login page if the user is logged out from the system', async ()=> {
//         await agent.get('/logout');
//         const res = await agent.get('/home');
//         expect(res.header['location']).toBe('/login');
//     })
// })


const request = require('supertest');
const express = require('express');
const session = require('express-session');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Product = require('../models/product');
const pagesController = require('../controllers/pages.controller'); // Fixed import

// Mock the helpers
jest.mock('../helpers/discount', () => ({
  showDiscount: jest.fn().mockReturnValue('10%'),
  calculateNewPrice: jest.fn().mockReturnValue(90),
}));

// Set up Express app for testing
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views'); // Adjust path if views folder is different
app.use(express.json());
app.use(
  session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Mock routes
app.get('/home', pagesController.homePage);
app.get('/auth', pagesController.authPage);
app.get('/discount', pagesController.discountPage);
app.get('/login', pagesController.authPage); // Map /login to authPage
app.get('/register', pagesController.authPage); // Map /register to authPage
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth');
});

// Set up MongoDB Memory Server
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Pages Controller', () => {
  let agent;

  beforeEach(() => {
    agent = request.agent(app); // Use agent to maintain session
  });

  describe('GET /login', () => {
    it('should navigate to login page', async () => {
      const res = await agent.get('/login');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /register', () => {
    it('should navigate to registration page', async () => {
      const res = await agent.get('/register');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /auth', () => {
    it('should render auth page', async () => {
      const res = await agent.get('/auth');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /home', () => {
    it('should redirect to /auth if user is not logged in', async () => {
      const res = await agent.get('/home');
      expect(res.status).toBe(302);
      expect(res.header['location']).toBe('/auth');
    });

    it('should redirect to /discount if user is admin', async () => {
      // Simulate admin user
      agent.app.use((req, res, next) => {
        req.session.user = { isAdmin: true, username: 'admin' };
        next();
      });
      const res = await agent.get('/home');
      expect(res.status).toBe(302);
      expect(res.header['location']).toBe('/discount');
    });

    it('should render home page for normal user', async () => {
      // Simulate normal user
      agent.app.use((req, res, next) => {
        req.session.user = { isAdmin: false, username: 'testUser' };
        next();
      });

      // Mock products
      await Product.create([
        { title: 'Product1', price: 100 },
        { title: 'Product2', price: 200 },
      ]);

      const res = await agent.get('/home');
      expect(res.status).toBe(200);
    });

    it('should handle database errors', async () => {
      // Simulate normal user
      agent.app.use((req, res, next) => {
        req.session.user = { isAdmin: false, username: 'testUser' };
        next();
      });

      // Mock database error
      jest.spyOn(Product, 'find').mockRejectedValue(new Error('Database error'));

      const res = await agent.get('/home');
      expect(res.status).toBe(500);
      expect(res.text).toBe('Error retrieving products');
    });
  });

  describe('GET /discount', () => {
    it('should render discount page for logged-in user', async () => {
      // Simulate logged-in user
      agent.app.use((req, res, next) => {
        req.session.user = { isAdmin: true, username: 'admin' };
        next();
      });

      // Mock products
      await Product.create([
        { title: 'Product1', price: 100 },
        { title: 'Product2', price: 200 },
      ]);

      const res = await agent.get('/discount');
      expect(res.status).toBe(200);
    });

    it('should handle database errors', async () => {
      // Simulate logged-in user
      agent.app.use((req, res, next) => {
        req.session.user = { isAdmin: true, username: 'admin' };
        next();
      });

      // Mock database error
      jest.spyOn(Product, 'find').mockRejectedValue(new Error('Database error'));

      const res = await agent.get('/discount');
      expect(res.status).toBe(500);
    });
  });

  describe('Navigation of admin and normal users', () => {
    it('should navigate to the home page if the user is normal user', async () => {
      // Simulate normal user
      agent.app.use((req, res, next) => {
        req.session.user = { isAdmin: false, username: 'testUser' };
        next();
      });

      const res = await agent.get('/home');
      expect(res.status).toBe(200);
    });

    it('should redirect to the auth page if the user is logged out from the system', async () => {
      // Simulate logout
      await agent.get('/logout');
      const res = await agent.get('/home');
      expect(res.status).toBe(302);
      expect(res.header['location']).toBe('/auth');
    });
  });
});