module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();

  //다음지도 api
   app.get('/map3', function(req, res){
         res.render('map3');
      });

  return route;

};
