module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();

  route.get('/logout', function(req, res){ //router끝날때 지정해줘서 /auth지워도됨
    req.logout(); //logout함수
    req.session.save(function(){
      res.redirect('/welcome');
    });
  });
  
  return route;

};
