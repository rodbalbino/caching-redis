'use strict';
require('dotenv').load();

const express = require('express');
const responseTime = require('response-time');
const axios = require('axios');
const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

var app = express();

app.use(responseTime());

client.on('connect', function () {
    console.log('Redis client connected!');
});

client.on('error', function (err) {
    console.log('Error on Redis: ', err.message)
});

const getBook = (req, res) => {
    let isbn = req.query.isbn;
    console.log(isbn)
    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

    axios.get(url)
        .then(response => {
            let book = response.data.items;
            let book_data = JSON.stringify(book);

            if (!book_data) 
                throw new Error('The book you are looking for is not found !!!');

            client.setex(isbn, 3600, book_data);
            res.send(book);
        })
        .catch(err => {
            res.send(err.message);
        });
};


const getCache = (req, res) => {
    let isbn = req.query.isbn;
    
    client.get(isbn, (err, result) => {
        if (err) throw err;
        if (result) {
            res.send(result);
        } else {
            getBook(req, res);
        }
    });
};

app.get('/book', getCache);

app.listen(3000, function () {
    console.log('Aplicação esta rodando na porta 3000.');
});

