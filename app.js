var cluster = require('cluster'); //클러스터모듈
var express = require('express'); //익스프레스모듈
var numCPUs = require('os').cpus().length;  //os모듈

if (cluster.isMaster) { //클러스터설정
    for(var i =0;i<numCPUs;i+=1)
        cluster.fork();
} else {
    // Workers share the TCP connection in this serve
    var session = require('express-session'); //세션 모듈불러오기
    var MySQLStore = require('express-mysql-session')(session);
    var bodyParser = require('body-parser');//바디파서 모듈불러오기
    var mysql      = require('mysql'); //mysql모듈불러오기
    var ejs = require('ejs');
    var http = require('http');
    var fs = require('fs');


    //var sha256 = require('sha256'); //sha512 보안모듈가져오기 안씀
    var bkfd2Password = require("pbkdf2-password"); //보안모듈
    var passport = require('passport');  // 패스포트인프라모듈
    var LocalStrategy = require('passport-local').Strategy;//유저네임패스워드직접입력패스포트모듈
    var FacebookStrategy = require('passport-facebook').Strategy;//페이스북타사인증

    var hasher = bkfd2Password();//hasher로 보안불러오기
    //익스프레스 (app)<객체생성
    var app = express();

    //앱이 바디파서를사용하겠다는 등록
    app.use(bodyParser.urlencoded({extended:false}));


    // //mysql연결
    // var pool      =    mysql.createPool({
    //   connectionLimit : 10, //pool에담을수있는최대인자수
    //   host     : 'localhost',
    //   user     : 'a',
    //   password : '1234',
    //   database : 'test1',
    //   debug    :  false
    // });

    //mysql연결
    var pool      =    mysql.createPool({
      connectionLimit : 10, //pool에담을수있는최대인자수
      host     : '210.123.254.249',
      user     : 'ahn',
      password : '12341234',
      database : 'ahn',
      debug    :  false
    });

    // //세션연결
    // app.use(session({
    //   secret: '0987654321~!@#$%^&*()_+',  //암호화
    //   resave: false,
    //   saveUninitialized: true,
    //   store:new MySQLStore({  //MySQLStore 옵션추가
    //     host:'localhost',
    //     port:3306,
    //     user:'a',
    //     password:'1234',
    //     database:'test1'
    //   })
    // }));

    //세션연결
    app.use(session({
      secret: '0987654321~!@#$%^&*()_+',  //암호화
      resave: false,
      saveUninitialized: true,
      store:new MySQLStore({  //MySQLStore 옵션추가
        host:'210.123.254.249',
        port:3306,
        user:'ahn',
        password:'12341234',
        database:'ahn'
      })
    }));

    app.use(passport.initialize()); //패스포트 초기화하고 사용하도록
    app.use(passport.session());    //패스포트를 이용해서 세션을사용하겟다.

    //로그인성공했을때일로오고 done함수를실행
    passport.serializeUser(function(user, done) {//done아래LocalStrategy  done과다른거다
      console.log('userididid@@@@'+user.username);
      console.log('userididid@@@@'+user.displayName);
      pool.query('update user set user_id=? where idx=1',user.username,function(rows,fields){
        console.log('success!!!');
      });
      done(null, user.authId);  //user.id로해서 다른사람들이랑안겹치게끔만들수이ㅆ음 varusers에넣어야함 세션에저장됨
    });
    //재접속했을때는
    passport.deserializeUser(function(id, done) {
      var sql = 'SELECT * FROM users WHERE authId=?';
      pool.query(sql, [id], function(err, results){ //첫인자 err, 둘째인자results
        if(err){
          console.log(err);
          done('There is no user');
        }else{
          done(null, results[0]);
        }
      });
    });


    //로컬전략객체만들어서 사용
    passport.use(new LocalStrategy(
      function(username, password, done){
        var uname = username;
        var pwd = password;
        var sql = 'SELECT * FROM users WHERE authId=?';
        pool.query(sql, ['local:'+uname],function(err, results){ //에러일때, 결과값
          if(err){
            console.log(results);
            return done('There is no user');
          }
          var user = results[0];
            return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                if(hash === user.password){ //사용자가맞다면
                    console.log('LocalStrategy',user);
                    done(null, user);//로그인성공 serializeUsert실행
                }else{//아니라면
                    done(null, false);//로그인실패
                }
            });
        });
    }
    ));
    //페이스북Strategy
    passport.use(new FacebookStrategy({
        clientID: '207405803097421', //TIMid
        clientSecret: '7456fda99521c3de35232dc88078ee47', //TIMpqwd
        callbackURL: "/auth/facebook/callback" , //facebookurl
        profileFields:['id', 'name','displayName']
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        var authId = 'facebook:'+profile.id;  //페북사용자 고유id값불러오기
        var sql= 'SELECT * FROM users WHERE authId=?';
        pool.query(sql, [authId], function(err, results){
          if(results.length>0){//사용자가존재한다면
            done(null, results[0]);
          }else{//사용자가없다면
            var newuser = { //기존사용자아닐때 새유저추가하는작업
              'authId':authId,
              'displayName': profile.displayName
            };
            var sql = 'INSERT INTO users SET ?'
            pool.query(sql, newuser, function(err, results){
              if(err){
                console.log(err);
                  done('Error');
              }else{
                done(null, newuser);
              }
            })
          }
        });
      }
    ));



    //로그아웃모듈
    var authlogout = require('./routes/authlogout')(app);   //auth모듈불러오기 app은 app도쓰겟다 //경로
    app.use('/auth', authlogout); //앞에 붙이는거 통일하는느낌
    //환영페이지
    var welcome = require('./routes/welcome');
    app.use('', welcome);
    //로그인페이지
    var authlogin = require('./routes/authlogin')(app);
    app.use('/auth', authlogin);
    //회원가입페이지
    var authregister = require('./routes/authregister')(app);
    app.use('/auth', authregister);
    //메인페이지
    var test = require('./routes/test')(app);
    app.use('', test);

    var test1 = require('./routes/test1')(app);
    app.use('', test1);

    var mlist = require('./routes/mlist')(app);//ejs예시
    app.use('', mlist);

    var board = require('./routes/board')(app);//ejs예시
    app.use('/board', board);

    var travelboard = require('./routes/travelboard')(app);//ejs예시
    app.use('/travelboard', travelboard);

    var mapboard = require('./routes/mapboard')(app);//ejs예시
    app.use('/mapboard', mapboard);

    var movieboard = require('./routes/movieboard')(app);//ejs예시
    app.use('/movieboard', movieboard);

    var movie = require('./routes/movie')(app);//ejs예시
    app.use('', movie);

    var map3 = require('./routes/map3')(app);//ejs예시
    app.use('', map3);

    // app.locals.pretty = true; //jade코드이쁘게만들기
    // app.set('view engine', 'jade'); //jade 템플릿엔진사용
    // app.set('views', './views');//jade 파일디렉토리

    //ejs추가
    app.set('views','./views');  //ejs파일디렉토리
    app.set('view engine', 'ejs');  //ejs템플릿엔진사용
    // app.engine('html', require('ejs').renderFile);




    //정적인파일이 위치할디렉토리위치
    app.use(express.static('public'));

    //listen객체사용 포트지정
    app.listen(3000, function(){
      console.log('Conneted 3000 port!');
    });

}
