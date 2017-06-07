module.exports = function(app){

  var express = require('express');
  var passport = require('passport');  // 패스포트인프라모듈
  //라우터객체생성
  var route = express.Router();
  var fs = require('fs');
  var mysql      = require('mysql'); //mysql모듈불러오기
  var ejs = require('ejs');
    var bodyParser = require('body-parser');
    var multipart = require('multiparty');


    //mysql연결
    var pool      =    mysql.createPool({
      connectionLimit : 10, //pool에담을수있는최대인자수
      host     : '210.123.254.249',
      user     : 'ahn',
      password : '12341234',
      database : 'ahn',
      debug    :  false
    });

  //다음지도 api
   route.get('/map3', function(req, res){
     if(req.user && req.user.displayName){ //정보불러옴
       var u_id = req.user.username;
      pool.query('SELECT * FROM map', function(error, rows, fields){
        if(error){
          console.log('error : ', error.message);
        }else{
          console.log('디비값', rows);
                  var json = JSON.stringify(rows);
                  //var sessionid = req.user.
                     res.render('map3', {json, u_id : u_id});
                }
            });
      }
    });







  return route;

};
