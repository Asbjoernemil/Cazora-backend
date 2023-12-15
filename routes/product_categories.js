import { Router } from 'express';
import connection from '../server.js';

const productCategoriesRouter = Router();

// Post product to a category
productCategoriesRouter.post('/', async (req, res) => {
    try {
        const { productId, categoryIds } = req.body;

        for (const categoryId of categoryIds) {
            const sql = 'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)';
            const [result] = await connection.execute(sql, [productId, categoryId]);
        }

        res.json({ message: 'Produktet er blevet tilføjet til kategorierne.' });
    } catch (error) {
        console.error('Fejl ved tilføjelse af produkt til kategorier: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all categories for one product
productCategoriesRouter.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const sql = 'SELECT * FROM product_categories WHERE product_id = ?';
        const [rows] = await connection.execute(sql, [productId]);

        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af kategorier for produkt: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all products by one category
productCategoriesRouter.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;

        const sql = `
            SELECT products.*, product_categories.*
            FROM products
            INNER JOIN product_categories ON products.id = product_categories.product_id
            WHERE product_categories.category_id = ?
        `;
        const [rows] = await connection.execute(sql, [categoryId]);

        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af produkter for kategori: ', error);
        res.status(500).send('Internal Server Error');
    }
});


// Delete a product from a category
productCategoriesRouter.delete('/:productId/:categoryId', async (req, res) => {
    try {
        const { productId, categoryId } = req.params;

        const sql = 'DELETE FROM product_categories WHERE product_id = ? AND category_id = ?';
        const [result] = await connection.execute(sql, [productId, categoryId]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Produktet er blevet fjernet fra kategorien.' });
        } else {
            res.status(404).send('Produktet eller kategorien blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved fjernelse af produkt fra kategori: ', error);
        res.status(500).send('Internal Server Error');
    }
});



// Get all details for a product
productCategoriesRouter.get('/details/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const sql = `
            SELECT products.*, categories.name AS category_name
            FROM products
            INNER JOIN product_categories ON products.id = product_categories.product_id
            INNER JOIN categories ON product_categories.category_id = categories.id
            WHERE products.id = ?
        `;
        const [rows] = await connection.execute(sql, [productId]);

        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af detaljer for produkt: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all products from one category
productCategoriesRouter.get('/products-in-category/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT products.*
            FROM products
            INNER JOIN product_categories ON products.id = product_categories.product_id
            WHERE product_categories.category_id = ?
        `;
        const [rows] = await connection.execute(sql, [id]);

        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af produkter i kategori: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all categories for each products with details
productCategoriesRouter.get('/categories-for-each-product', async (req, res) => {
    try {
        const sql = `
            SELECT products.*, GROUP_CONCAT(categories.name) AS category_names
            FROM products
            INNER JOIN product_categories ON products.id = product_categories.product_id
            INNER JOIN categories ON product_categories.category_id = categories.id
            GROUP BY products.id
        `;
        const [rows] = await connection.execute(sql);

        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af kategorier for hvert produkt: ', error);
        res.status(500).send('Internal Server Error');
    }
});


export default productCategoriesRouter;
