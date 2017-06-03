module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();
  var passport = require('passport');  // 패스포트인프라모듈
  var LocalStrategy = require('passport-local').Strategy;//유저네임패스워드직접입력패스포트모듈
  var FacebookStrategy = require('passport-facebook').Strategy;//페이스북타사인증
  var bkfd2Password = require("pbkdf2-password"); //보안모듈
  var hasher = bkfd2Password();//hasher로 보안불러오기
  var mysql      = require('mysql'); //mysql모듈불러오기


    // //mysql연결
    // var pool      =    mysql.createPool({
    //   connectionLimit : 10, //pool에담을수있는최대인자수
    //   host     : 'localhost',
    //   user     : 'a',
    //   password : '1234',
    //   database : 'test1',
    //   debug    :  false
    // });

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

// //로그인성공페이지
// route.get('/welcome', function(req, res){
//   if(req.user && req.user.displayName){ //정보불러옴
//     if(req.user.username == 'admin'){
//       var u_id = req.user.username;  //user가패스포트값불러오기
//         console.log(u_id);
//       res.render('./welcomeadmin', {u_id : u_id});
//     }else{
//       var u_id = req.user.username;  //user가패스포트값불러오기
//       var u_faceid = req.user.displayName
//         console.log(u_id);
//         console.log(u_faceid);
//       res.render('./welcomeuser',{u_id : u_id, u_faceid : u_faceid});
//   }
//   } else{
//     res.render('welcomex');
//   }
// });
