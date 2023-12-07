import { Router } from 'express';
import connection from '../server.js';

const reservationsRouter = Router();

// Hent alle reservationer
reservationsRouter.get('/', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM reservations');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af reservationer: ', error);
        res.status(500).send('Internal Server Error');
    }
});

reservationsRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.execute('SELECT * FROM reservations WHERE id = ?', [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Reservationen blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved hentning af specifik reservation: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Opret en ny reservation
reservationsRouter.post('/', async (req, res) => {
    try {
        const reservation = req.body;

        const createReservationSql = 'INSERT INTO reservations (fittingRoom, product, contactInfo, pickUpTime) VALUES (?, ?, ?, ?)';
        const reservationValues = [reservation.fittingRoom, reservation.product, reservation.contactInfo, reservation.pickUpTime];

        const [resultReservation] = await connection.execute(createReservationSql, reservationValues);

        if (resultReservation.affectedRows > 0) {
            // Opdater produktet til at være reserveret
            const updateProductSql = 'UPDATE products SET reserved = true WHERE id = ?';
            const [resultUpdateProduct] = await connection.execute(updateProductSql, [reservation.product]);

            if (resultUpdateProduct.affectedRows > 0) {
                res.json({ message: 'Reservation oprettet med succes, og produktet er nu markeret som reserveret.' });
            } else {
                res.status(500).send('Fejl ved opdatering af produktets status til reserveret.');
            }
        } else {
            res.status(500).send('Fejl ved oprettelse af reservation.');
        }
    } catch (error) {
        console.error('Fejl ved oprettelse af reservation: ', error);
        res.status(500).send('Internal Server Error');
    }
});


// Slet reservation ved id
reservationsRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'DELETE FROM reservations WHERE id = ?';
        const [result] = await connection.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ message: 'Reservation slettet med succes.' });
        } else {
            res.status(404).send('Reservationen blev ikke fundet.');
        }
    } catch (error) {
        console.error('Fejl ved sletning af reservation: ', error);
        res.status(500).send('Internal Server Error');
    }
});

export default reservationsRouter;