var cluster = require('cluster'); //클러스터모듈
var express = require('express'); //익스프레스모듈
var numCPUs = require('os').cpus().length;  //os모듈

if (cluster.isMaster) { //클러스터설정
        cluster.fork();
} else {
    // Workers share the TCP connection in this server
    var session = require('express-session'); //세션 모듈불러오기
    var MySQLStore = require('express-mysql-session')(session);
    var bodyParser = require('body-parser');//바디파서 모듈불러오기
    var mysql      = require('mysql'); //mysql모듈불러오기

    //var sha256 = require('sha256'); //sha512 보안모듈가져오기 안씀
    var bkfd2Password = require("pbkdf2-password"); //보안모듈
    var passport = require('passport');  // 패스포트모듈
    var LocalStrategy = require('passport-local').Strategy;//패스포트모듈


    var hasher = bkfd2Password();//hasher로 보안불러오기
    //익스프레스 (app)<객체생성
    var app = express();

    //앱이 바디파서를사용하겠다는 등록
    app.use(bodyParser.urlencoded({extended:false}));

    //mysql연결
    var pool      =    mysql.createPool({
      connectionLimit : 10, //pool에담을수있는최대인자수
      host     : 'localhost',
      user     : 'a',
      password : '1234',
      database : 'test1',
      debug    :  false
    });

    //세션연결
    app.use(session({
      secret: '0987654321~!@#$%^&*()_+',  //암호화
      resave: false,
      saveUninitialized: true,
      store:new MySQLStore({  //MySQLStore 옵션추가
        host:'localhost',
        port:3306,
        user:'a',
        password:'1234',
        database:'test1'
      })
    }));

    app.use(passport.initialize()); //패스포트 초기화하고 사용하도록
    app.use(passport.session());    //패스포트를 이용해서 세션을사용하겟다.


    //세션예제
    app.get('/count', function(req, res){
      if(req.session.count){
        req.session.count++;
      }else{
        req.session.count =1;
      }

      res.send('count: '+req.session.count);
    });

    app.get('/auth/logout', function(req, res){
      req.logout(); //logout함수
      req.session.save(function(){
        res.redirect('/welcome');
      });
    });


    //로그인성공페이지
    app.get('/welcome', function(req, res){
      if(req.user && req.user.name){ //정보불러옴
        res.send(`
          <h1>Hello, ${req.user.name}</h1>
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

    //로그인성공했을때일로오고 done함수를실행
    passport.serializeUser(function(user, done) {//done아래LocalStrategy  done과다른거다
      console.log('serializeUser',user);
      done(null, user.id);  //user.id로해서 다른사람들이랑안겹치게끔만들수이ㅆ음 varusers에넣어야함 세션에저장됨
    });
    //재접속했을때는
    passport.deserializeUser(function(id, done) {
      console.log('deserializeUser', id);
      for(var i=0; i<users.length; i++){
        var user = users[i];
        if(user.id === id){
          return done(null ,user);//앞인자 에러없으면null뒤인자
        }
      }
      });

    //로컬전략객체만들어서 사용
    passport.use(new LocalStrategy(
      function(id, password, done){
        var uname = id;
        var pwd = password;
        for(var i=0; i<users.length; i++){
          var user= users[i];
          if(uname === user.id){
            return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
              if(hash === user.password){ //사용자가맞다면
                console.log('LocalStrategy',user);
                done(null, user);//로그인성공 serializeUsert실행
              }else{//아니라면
                done(null, false);//로그인실패
              }
            });
          }
      }
      done(null,false);
    }
    ));

    //로그인받아서 인증하는부분
    app.post(
      '/auth/login',
    passport.authenticate(  //저런 미들웨어로받는다
      'local',  //local전략을 실행 내꺼
      {
        successRedirect: '/welcome',     //로그인인증하면리다이렉트
        failureRedirect: '/auth/login',   //실패했을때리다이렉트
        failureFlash: false  //굳이안해도되서
       }
      )
    );


/*
    //로그인받아서 인증하는부분
    app.post('/auth/login', function(req, res){

      var uname = req.body.username;
      var pwd = req.body.password;
      for(var i=0; i<users.length; i++){
        var user= users[i];
        if(uname === user.username){
          return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
            if(hash === user.password){
              req.session.displayName = user.displayName;
              req.session.save(function(){
                res.redirect('/welcome');
              })
            }else{
              res.send('누구세요?? <a href="/auth/login">login</a>');
            }
          });
        }
      /*if(uname === user.username && sha256(pwd+user.salt) === user.password){ //사용자비번도암호화 (인증)
        req.session.displayName = user.displayName;
        return req.session.save(function(){   //저장
          res.redirect('/welcome'); //일로바로보내버린다
      });
    }**---
    }
        res.send('누구세요?? <a href="/auth/login">login</a>');
    });
*/

    //세션로그인
    app.get('/auth/login', function(req, res){
      var output = `
      <h1>TIM 로그인</h1>
      <form action="/auth/login"method="post">
        <p>
          <input type="text" name="id" placeholder="아이디를 입력하세요">
        </p>
        <p>
          <input type="password" name="password" placeholder="비밀번호를 입력하세요">
        </p>
        <p>
          <input type = "submit">
        </p>
      </form>
      `;
      res.send(output);
    });

    //전역객체
    var users =[
      {
        //id:1,이런식으로?
      id:'egoing',
      password:'0xCzfI+Lm725stSAHf+nZlL812B3m6LRu0Rwkp9hovdbEdBUGKtq/uWgN6pQ4tUHPU4YjmDBT9DKp/GVzhp0h9132e9w832Fj0BhcYbO2xpbSjdL5PCc79tYdck63srKd5FK8LsNYqdfXtP7nb7DVSxLY59LZae+r6i6sBE7XFQ=', //111111을암호화한 해쉬값+salt
      salt:'//gVTinJS5xcLTjwwERtiolrAyOEW1f6gDC02aYhffgyj+JP5I0pn3/bmmOpnpA491xzu+I6arGOCLzfgRmxow==',  //보안더확실하게
      name:'Egoing' //화면에표시하는닉네임같은거
    }
  ];

    //회원가입받는곳
    app.post('/auth/register', function(req, res){
      hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
          id:req.body.id,
          name:req.body.name,
          age:req.body.age,
          password:hash

        };

    var query = pool.query('insert into users set ?',user,function(err,result){
    if (err) {
        console.error('ddd'+err);
        throw err;
    }
    console.log('++++'+query);
    res.send(200,'success');
});
        // users.push(user);
        // req.login(user, function(err){
        //   req.session.save(function(){
        //     res.redirect('/welcome');
        // });
        // });
      });
    });

    //회원가입
    app.get('/auth/register', function(req, res){
      var output = `
      <h1>TIM 회원가입</h1>
      <form action="/auth/register" method="post">
        <p>
          <input type="text" name="id" placeholder="아이디를 입력하세요">
        </p>
        <p>
          <input type="password" name="password" placeholder="비밀번호를 입력하세요">
        </p>
        <p>
          <input type="text" name="name" placeholder="이름">
        </p>
        <p>
          <input type="text" name="age" placeholder="age">
        </p>
        <p>
          <input type = "submit">
        </p>
      </form>
      `;
      res.send(output);
    });


    // 기본users테이블검색
    /*
    var sql = 'SELECT * FROM users';
    pool.query(sql, function (err, rows, fields){
      if(err){ //에러있을때
        console.log(err); //에러메시지콘솔창
      }else{ //아니면
        for(var i=0; i<rows.length; i++){
        console.log(rows[i].id); //데이터값들메세지
        //console.log('fields', fields); //컬럼에대한 정보 일반적으로안씀
      }
    }
    });*/

    //등록하는법
    /*
    var sql = 'INSERT INTO users (id, name, age, password) VALUES(?, ?, ?, ?)';
    var params = ['super', 'ww' , '1' , '1234']; //??하면 파람값들어감 순서중요
    pool.query(sql, params, function(err, rows, fields){
      if(err){
        console.log(err);
      }else{
        console.log(rows.insertId);
      }
    });*/

    //수정하는법
    /*
    var sql = 'UPDATE users SET name=?, age=? WHERE id=?'; //앞에꺼를바꾸고 어디에서 id에서
    var params = ['바꿈', '20' , 'super']; //???순서대로써줘야함
    pool.query(sql, params, function(err, rows, fields){
      if(err){
        console.log(err);
      }else{
        console.log(rows);
      }
    });*/

    //삭제하는법
    /*
    var sql = 'DELETE FROM users WHERE id=?';
    var params = ['1'];
    pool.query(sql, params, function(err, rows, fields){
      if(err){
        console.log(err);
      }else{
        console.log(rows);
      }
    });
    */
    //-----------------------------*/


    app.locals.pretty = true; //jade코드이쁘게만들기


    app.set('view engine', 'jade'); //jade 템플릿엔진사용
    app.set('views', './views');//jade 파일디렉토리

    //정적인파일이 위치할디렉토리위치
    app.use(express.static('public'));

    //template접속했을때
    app.get('/template', function(req, res){
      res.render('temp', {time:Date()});  //date옆에 , title:'jade'
    }) //render는 temp라는파일을 불러온다 /time넣기

    //사용자가 홈으로 접속했을때 보여주는페이지 (http://localhost:3000/)
    app.get('/', function(req, res){
      res.send('Hello Tim homepage');
    });

    //동적  ``<<물결아래있는거(그레이브엑센트)
    app.get('/dynamic', function(req, res){
      var lis ='';
      for(var i=0; i<5; i++){lis = lis +'<li>coding</li>';} //동적일때만js사용가능
      var time = Date(); //현재시간

      var output = `<!DOCTYPE html>
      <html>
      	<head>
      		<meta charset="UTF-8">
      		<title>TIM</title>
      	</head>
      <body>
      	<h1>TIM 로그인</h1>
      	${lis}
        ${time}
      	</form>
      </body>
      </html>
    ` //${}변수선언할때
      res.send(output)
    });

    //쿼리스트링url로정보불러오기c
    app.get('/topic', function(req, res){
      var topics = [
        'javascript',
        'nodejs',
        'express'
      ];
      var str = `
      <a href="/topic?id=0">javascript</a><br>
      <a href="/topic?id=1">nodejs</a><br>
      <a href="/topic?id=2">express</a><br>
      `;
      var output =str + topics[req.query.id]  //.id이거에따라주소설정바뀌면바뀜
      res.send(output);       //시멘틱웹일때는 위에/topic:id 바꾸고 [req.params.id]
    });

    //

    //직접사진파일과 글 불러오기
    app.get('/logo', function(req, res){
      res.send('hello logo, <img src = "/timlogo.jpeg">')
    });

    //로그인페이지 (http://localhost:3000/login)
    app.get('/login', function(req, res){
      res.send('<h1>login please</h1>');
    });

    //listen객체사용 포트지정
    app.listen(3000, function(){
      console.log('Conneted 3000 port!');
    });

}
