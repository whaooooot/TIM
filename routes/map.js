module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();

  //구글지도 api
   app.get('/map', function(req, res){
         res.render('map');
      });

  return route;

};
