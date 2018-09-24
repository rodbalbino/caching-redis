'use strict';

const express = require('express');
const responseTime = require('response-time');
const axios = require('axios');

var app = express();

//Cria um middleware que adiciona um X-Response-Time no header para as respostas
app.use(responseTime());

const getBook = (req, res) => {
    let isbn = req.query.isbn;
    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

    axios.get(url)
    .then(response => {
        let book = response.data.items;
        res.send(book);
    })
    .catch(err => {
        res.send('O livro que você esta procurando não foi encontrado !!!');
    });
};

app.get('/book', getBook);

app.listen(3000, function(){
    console.log('Node esta rodando na porta 3000 !!!');
});

