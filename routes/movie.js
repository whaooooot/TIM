module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();
  var mysql      = require('mysql'); //mysql모듈불러오기
  var ejs = require('ejs');


  var pool      =    mysql.createPool({
    connectionLimit : 10, //pool에담을수있는최대인자수
    host     : '210.123.254.249',
    user     : 'ahn',
    password : '12341234',
    database : 'ahn',
    debug    :  false
  });


    route.get('/movie/:idx', function(req,res,next){

    var idx = req.params.idx;
          pool.getConnection(function (err, connection) {
              // Use the connection
              var movie = "SELECT idx, moviek, moviee, poster FROM movie where idx=?";
              connection.query(movie, [idx],  function (err, rows) {
                console.log("@@"+idx);
                  if (err){ console.error("err : " + err);}
                  else{
                  console.log("rows : " + JSON.stringify(rows));

                  res.render('movie', {rows : rows});
                  connection.release();

                }
              });
          });
      });


    route.post('/movie/:idx', function(req,res,next){

    var idx = req.query.idx;
          pool.getConnection(function (err, connection) {
              // Use the connection
              var movie = "SELECT idx, moviek, moviee, poster FROM movie";
              connection.query(movie, [idx],  function (err, rows) {

                  if (err){ console.error("err : " + err);}
                  else{
                  console.log("idx@@@@@"+idx);
                  console.log("rows : " + JSON.stringify(rows));

                  res.render('movie', {rows : rows});
                  connection.release();

                }
              });
          });
      });


  return route;

};
