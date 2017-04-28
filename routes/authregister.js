
module.exports = function(app){

  var express = require('express');
  var passport = require('passport');  // 패스포트인프라모듈
  var LocalStrategy = require('passport-local').Strategy;//유저네임패스워드직접입력패스포트모듈
  var FacebookStrategy = require('passport-facebook').Strategy;//페이스북타사인증
  var bkfd2Password = require("pbkdf2-password"); //보안모듈
  var hasher = bkfd2Password();//hasher로 보안불러오기
  var mysql      = require('mysql'); //mysql모듈불러오기

  //라우터객체생성
  var route = express.Router();

  //mysql연결
  var pool      =    mysql.createPool({
    connectionLimit : 10, //pool에담을수있는최대인자수
    host     : 'localhost',
    user     : 'a',
    password : '1234',
    database : 'test1',
    debug    :  false
  });

  //회원가입받는곳
  route.post('/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var user = {
        authId:'local:'+req.body.username,
        username:req.body.username,
        password:hash,
        salt:salt,
        displayName:req.body.displayName
      };
      var sql = 'INSERT INTO users SET ?'; //회원가입sql
      pool.query(sql, user, function(err, results){ //pool이니까pool로해줌
        if(err){
          console.log(err);
          res.status(500);
        }else{
          req.login(user, function(err){
            req.session.save(function(){
              res.redirect('/welcome');
          });
          });
        }
      });
    });
  });

  //회원가입
  route.get('/register', function(req, res){
    res.render('register');
  });


  return route;

};
