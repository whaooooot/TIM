module.exports = function(app){

  var express = require('express');
  var passport = require('passport');  // 패스포트인프라모듈
  var LocalStrategy = require('passport-local').Strategy;//유저네임패스워드직접입력패스포트모듈
  var FacebookStrategy = require('passport-facebook').Strategy;//페이스북타사인증

  //라우터객체생성
  var route = express.Router();

  //로그인받아서 인증하는부분  //post부분이 저거면ejs에서 폼도 저거여야함
  route.post('/authlogin',
  passport.authenticate(  //저런 미들웨어로받는다
    'local',  //local전략을 실행 내꺼
    {
      successRedirect: '/welcome',     //로그인인증하면리다이렉트
      failureRedirect: '/auth/login',   //실패했을때리다이렉트
      failureFlash: false  //굳이안해도되서
     }
    )
  );
  // 페이스북라우트 타사인증일땐 대체로 2개
  route.get(
    '/facebook',
  passport.authenticate(
    'facebook'
    )
  );
  //두번째단계 페이스북라우트
  route.get(
    '/facebook/callback',
  passport.authenticate(
    'facebook',
   {
     //successRedirect: '/welcome',   //성공했을때 일로보내자
     failureRedirect: '/auth/login'   //실패햇을때일로보내자
   }
  ),
  function(req,res){
   req.session.save(function(){
     res.redirect('/welcome')
   })
  }
  );


  //세션로그인
  route.get('/login', function(req, res){ //url
    res.render('login'); //불러오는템플릿앞에 views가자동으로붙음
  });

  return route;

};
