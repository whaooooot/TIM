var express = require('express');

//라우터객체생성
var route = express.Router();

//로그인성공페이지
route.get('/welcome', function(req, res){
  if(req.user && req.user.displayName){ //정보불러옴
    if(req.user.username == 'admin'){
      res.send(`
        <h1>Hello, ${req.user.displayName}</h1>
        <a href="/auth/logout">logout</a><br>
        <a href="/map2">map</a>
        <a href="/test">test</a>
        `);
    }else{
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a><br>
      <a href="/map2">map</a>
      `);
  }
  } else{
    res.render('welcomex');
  }
});

module.exports = route;
