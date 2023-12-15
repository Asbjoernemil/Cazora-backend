import { Router } from 'express';
import connection from '../server.js';

const productSizesRouter = Router();

// Get product sizes
productSizesRouter.get('/products-by-size/:sizeName', async (req, res) => {
    try {
        const { sizeName } = req.params;

        const sql = `
           SELECT products.*
            FROM products
            INNER JOIN product_sizes ON products.id = product_sizes.product_id
            INNER JOIN sizes ON product_sizes.size_id = sizes.id
            WHERE sizes.name = ?
        `;

        const [rows] = await connection.execute(sql, [sizeName]);

        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af produkter efter størrelse: ', error);
        res.status(500).send('Internal Server Error');
    }
});

export default productSizesRouter;