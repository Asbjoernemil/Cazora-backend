import { Router } from 'express';
import connection from '../server.js';

const reservationsRouter = Router();

// Get reservation
reservationsRouter.get('/', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT reservations.*, products.name AS productName, products.price AS productPrice, products.img AS productImg FROM reservations INNER JOIN products ON reservations.product = products.id');
        res.json(rows);
    } catch (error) {
        console.error('Fejl ved hentning af reservationer: ', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get reservation by id
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

// Create reservation
reservationsRouter.post('/', async (req, res) => {
    try {
        const reservation = req.body;

        const sql = 'CALL CreateReservation(?, ?, ?, ?)';
        const values = [reservation.fittingRoom, reservation.productId, reservation.contactInfo, reservation.pickUpTime];

        const [result] = await connection.execute(sql, values);

        if (result.warningStatus === 0) {
            res.json({ message: 'Reservation oprettet med succes, og produktet er nu markeret som reserveret.' });
        } else {
            res.status(500).send('Fejl ved oprettelse af reservation.');
        }
    } catch (error) {
        console.error('Fejl ved oprettelse: ', error);
        res.status(500).send('Internal Server Error');
    }
});


// Delete reservation by id
reservationsRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = 'CALL CancelReservation(?)';
        const [result] = await connection.execute(sql, [id]);

        if (result.affectedRows === 0) {
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