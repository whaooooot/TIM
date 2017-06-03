var express = require('express');

//라우터객체생성
var route = express.Router();

//로그인성공페이지
route.get('/welcome', function(req, res){
  if(req.user && req.user.displayName){ //정보불러옴
    if(req.user.username == 'admin'){
      var u_id = req.user.username;  //user가패스포트값불러오기
        console.log(u_id);
      res.render('./welcomeadmin', {u_id : u_id});
    }else{
      var u_id = req.user.username;  //user가패스포트값불러오기
      var u_faceid = req.user.displayName
        console.log(u_id);
        console.log(u_faceid);
      res.render('./welcomeuser',{u_id : u_id, u_faceid : u_faceid});
  }
  } else{
    res.render('/welcome');
  }
});

module.exports = route;
