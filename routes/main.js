module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();

  route.get('/main', function(req, res){ //router끝날때 지정해줘서 /auth지워도됨
  res.render('index',{
    title:"myhomepage",
    length:5
    })
  });

  return route;

};
