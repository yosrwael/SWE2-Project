const express = require("express");
const app = express();
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const mongoose = require("mongoose");
const session = require("express-session");
const productRoutes = require('./routes/product.route');
const userRoutes = require('./routes/user.route');
const discountRoutes = require('./routes/discount.route');
const authRoutes = require('./routes/auth.route');
const pageRoutes = require('./routes/pages.route');
require("dotenv").config();
console.log("Mongo URI:", process.env.connect_DB);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("views"));

mongoose
  .connect(process.env.connect_DB)
  .then(() => console.log("connected..."))
  .catch((e) => console.log(e));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use('/api', productRoutes);

app.use('/api', userRoutes);

app.use('/api', discountRoutes);

app.use('/', authRoutes);

app.use('/', pageRoutes);

// app.get('/', (req, res) => {
//   res.send('views/home'); // or res.render('index') if you have a view
// });




app.listen(process.env.PORT, () => {

  console.log(`Server is running on port ${process.env.PORT}`);
}
);


// const express = require("express");
// const app = express();
// const session = require("express-session");
// const productRoutes = require('./routes/product.route');
// const userRoutes = require('./routes/user.route');
// const discountRoutes = require('./routes/discount.route');
// const authRoutes = require('./routes/authentication.route');
// const pageRoutes = require('./routes/pages.route');

// app.set("view-engine", "ejs");
// app.use(express.static("views"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: "secret_key",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false },
//   })
// );

// // app.use("/api/users", require("./routes/usersApi/getRoutes"));
// // app.use("/api/users", require("./routes/usersApi/postRoutes"));
// // app.use("/api/users", require("./routes/usersApi/putRoutes"));
// // app.use("/api/users", require("./routes/usersApi/deleteRoutes"));

// // app.use("/api/products", require("./routes/productsApi/getRoutes"));
// // app.use("/api/products", require("./routes/productsApi/postRoutes"));
// // app.use("/api/products", require("./routes/productsApi/putRoutes"));
// // app.use("/api/products", require("./routes/productsApi/deleteRoutes"));

// // app.use("/", require("./routes/view/authRoutes"));
// // app.use("/", require("./routes/view/viewRoutes"));

// // app.use("/api/discount", require("./routes/discountApi/applyDiscount"));
// // app.use("/api/discount", require("./routes/discountApi/removeDiscount"));

// app.use('/api', productRoutes);

// app.use('/api', userRoutes);

// app.use('/api', discountRoutes);

// app.use('/', authRoutes);

// app.use('/', pageRoutes);

// module.exports = app;

