var express = require('express');

//라우터객체생성
var route = express.Router();


//로그인성공페이지
route.get('/welcome', function(req, res){
  if(req.user && req.user.displayName){ //정보불러옴
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
      `);
  } else{
    res.send(`
      <h1>Welcome</h1>
      <ul>
      <li><a href="/auth/login">Login</a></li>
      <li><a href="/auth/register">Register</a></li>
      </ul>
      `);
  }
});

module.exports = route;
