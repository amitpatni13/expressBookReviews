const express = require('express');
const axios = require('axios');
const path = require('path');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

function getBooks() {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ message: 'Error fetching books' });
        }
    });
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getBooks()
        .then((bookList) => res.status(200).send(bookList))
        .catch((error) => res.status(404).send(error));
});

function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        if (books) {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject({ message: 'No Books present with isbn ' + isbn });
            }
            resolve(book);
        } else {
            reject({ message: 'Error fetching books' });
        }
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then((book) => res.status(200).send(book))
        .catch((error) => res.status(404).send(error));
});

function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        if (books) {
            const keys = Object.keys(books);
            let bookList = [];
            for (let isbn of keys) {
                if (books[isbn].author === author) {
                    bookList.push(books[isbn]);
                }
            }
            if (bookList.length) {
                resolve(bookList);
            } else {
                reject({ message: 'No Books present from author ' + author });
            }
        } else {
            reject({ message: 'Error fetching books' });
        }
    });
}
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then((bookList) => res.status(200).send(bookList))
        .catch((error) => res.status(404).send(error));
});

function getBookByTitle(title) {
    return new Promise((resolve, reject) => {
        if (books) {
            const keys = Object.keys(books);
            let book = {};
            for (let isbn of keys) {
                if (books[isbn].title === title) {
                    book = books[isbn];
                    break;
                }
            }
            if (book?.title) {
                resolve(book);
            } else {
                reject({ message: 'No Books present with title ' + title })
            }
        } else {
            reject({ message: 'Error fetching books' });
        }
    });
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBookByTitle(title)
        .then((book) => res.status(200).send(book))
        .catch((error) => res.status(404).send(error));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        const book = books[isbn];
        if (book?.reviews) {
            return res.status(200).json(book.reviews);
        } else {
            return res.status(404).json({ message: 'No Books present with isbn ' + isbn })
        }
    } else {
        return res.status(404).json({ message: 'Error fetching books' });
    }
});

module.exports.general = public_users;
