import express from 'express';
import mysql from 'mysql2/promise';
import fs from 'fs';
import cors from 'cors';
import "dotenv/config"

// Import routes
import productsRouter from './routes/productsRouter.js';
import categoriesRouter from './routes/categoriesRoutes.js';
import productCategoriesRouter from './routes/product_categories.js';
import sizeRouter from './routes/sizeRouter.js';
import productSizesRouter from './routes/product_sizesRouter.js';
import reservationsRouter from './routes/reservationsRouter.js';

const app = express();
const port = process.env.PORT || 3000;


// database connection
const dbconnect = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: process.env.MYSQL_CHARSET,
};

if (process.env.MYSQL_CERT) {
    dbconnect.ssl = { cs: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") }
};

//create connection
const connection = await mysql.createConnection(dbconnect)

app.use(cors())
app.use(express.json())


// use routes
app.use("/products", productsRouter);
app.use('/categories', categoriesRouter);
app.use('/productCategories', productCategoriesRouter);
app.use('/sizes', sizeRouter);
app.use('/productSizes', productSizesRouter);
app.use('/reservations', reservationsRouter);

// Start server
app.listen(port, () => console.log(`listening on port ${port}`));

export default connection