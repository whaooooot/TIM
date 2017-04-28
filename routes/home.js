

module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();

  //사용자가 홈으로 접속했을때 보여주는페이지 (http://localhost:3000/)
  route.get('/', function(req, res){
    res.send('Hello Tim homepage');
  });

  return route;

};
