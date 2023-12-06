import express from 'express';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import cors from 'cors';

// Importer routes
import productsRouter from './routes/productsRouter.js';
import categoriesRouter from './routes/categoriesRoutes.js';
import productCategoriesRouter from './routes/product_categories.js';
import sizeRouter from './routes/sizeRouter.js';

const app = express();
const port = process.env.PORT || 3000;


// opret forbindelse til database
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Database',
    database: 'cazora_database',
    charset: 'utf8mb4',
});

app.use(cors())
app.use(express.json())


// brug routes
app.use("/products", productsRouter);
app.use('/categories', categoriesRouter);
app.use('/productCategories', productCategoriesRouter);
app.use('/sizes', sizeRouter);


// Start server
app.listen(port, () => console.log(`Genbrugstøjbutik-app listening on port ${port}`));

export default connection