require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const corsOption = require('./config/corsOption');
const credentials = require('./middleware/credentials');

app.use(credentials);
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//front end's request need 'with-credential' tag to set to 'include' to pass cookies
app.use(cookieParser());

app.use('/api/v1/users/register', require('./routes/register'));
app.use('/api/v1/users/login', require('./routes/login'));
app.use('/api/v1/users/logout', require('./routes/logout'));
app.use('/api/v1/users/refresh', require('./routes/refresh'));

// app.use(verifyJWT);
app.use('/api/v1/users/posts', require('./routes/posts'));
app.use('/api/v1/users/post', require('./routes/post'));
app.use('/api/v1/users/likes', require('./routes/likes'));
//Get all users
app.get('/api/v1/users', async (req, res) => {

    try {
        const result = await db.query('SELECT * FROM users');

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: {
                users: result.rows
            }
        });
    }

    catch(err) {
        console.log(err);
    }
    
});

//Get a single user
app.get('/api/v1/users/:id', async (req, res) => {

    const id = req.params.id;

    try {

        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);

        res.status(200).json({
            status: 'success',
            data: {
                user: result.rows
            }
        })
    }
    catch (err) {
        console.log(err);
    }
    
});

//Update user
app.put('/api/v1/users/:id', async (req, res) => {
    try {

        const result = await db.query(
            'UPDATE users SET name = $1, cake_day = $2, karma = $3, country = $4 WHERE id = $5 RETURNING *',
            [req.body.name, req.body.cake_day, req.body.karma, req.body.country, req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {
                user: result.rows
            }
        });
    }
    catch (err) {
        console.log(err);
    }

});

//delete user
app.delete('/api/v1/users/:id', async (req , res) => {
    try {

        const result = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);

        res.status(204).json({
            status: 'success',
        });
    }
    catch (err) {
        console.log(err);
    }

});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})