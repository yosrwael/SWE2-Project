const mongoose = require('mongoose')
const app = require('./app')

require('dotenv').config();

mongoose.connect(process.env.connect_DB).then(() => {
    app.listen(8018, () => console.log('Server started on port 8018'));
}).catch((err) => {
    console.log(err);
});