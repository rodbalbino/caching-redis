'use strict';

const express = require('express');
const responseTime = require('response-time');
const axios = require('axios');
const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

var app = express();

//Cria um middleware que adiciona um X-Response-Time no header para as respostas
app.use(responseTime());

const getBook = (req, res) => {
    let isbn = req.query.isbn;
    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

    axios.get(url)
        .then(response => {
            let book = response.data.items;
            // Configura a chave:isbn no cache. Com ele o conteudo do cache : titulo
            // Configura tempo de expiração do cache para 1 hora (60 min)
            client.setex(isbn, 3600, JSON.stringify(book));

            res.send(book);
        })
        .catch(err => {
            res.send('O livro que você esta procurando não foi encontrado !!!');
        });
};


const getCache = (req, res) => {
    let isbn = req.query.isbn;
    // Checa os dados do cache do servidor redis
    client.get(isbn, (err, result) => {
        if (result) {
            res.send(result);
        } else {
            getBook(req, res);
        }
    });
};


app.get('/book', getCache);

app.listen(3000, function () {
    console.log('Node esta rodando na porta 3000 !!!');
});

