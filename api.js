/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      var search = req.query;
      //if(search._id){search._id = new ObjectId(search._id)}
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').find(search).toArray((err,docs)=>{
          if(err)
            console.log(err);
          docs = docs.map((obj)=>{
            obj.commentCount = obj.commentCount.length;
            return obj;
          });
          res.json(docs);
        });
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      var regex = /^\s*$/g;
      if(regex.test(title))
        res.send('title empty');
    else{
      
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        if(err)
          console.log(err);
        db.collection('books').insert({title: title, commentCount: []},(err,doc)=>{
          if(err)
            console.log(err);
          var book = doc.ops;
          book[0].commentCount = book[0].commentCount.length;
          delete book[0].commentCount;
          res.json(book);
        });
      });
      
    }
      
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').deleteMany({},(err,doc)=>{
          if(err)
            console.log(err);

            res.send('complete delete successful');
        });
      });
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').findOne({_id: new ObjectId(bookid)},(err,doc)=>{
          if(err)
            console.log(err);
          if(doc)
            res.json(doc);
          else
            res.send('no book exists');
        });
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').findOneAndUpdate(
          {_id: new ObjectId(bookid)},
          {$push:{commentCount: comment}},
          (err,doc)=>{
            if(err)
              console.log(err);
            doc.value.commentCount.push(comment);
            res.json(doc.value);
          }
        );
      });
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').deleteOne({_id: new ObjectId(bookid)},(err,doc)=>{
          if(err)
            console.log(err);
          res.send('delete successful');
        });
      });
      //if successful response will be 'delete successful'
      
    });
  
  
  
};
