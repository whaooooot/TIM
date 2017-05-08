module.exports = function(app){

  var express = require('express');
  //라우터객체생성
  var route = express.Router();
  var fs = require('fs');
  var mysql      = require('mysql'); //mysql모듈불러오기
  var ejs = require('ejs');
  var bodyParser = require('body-parser');

  //mysql연결
  var pool      =    mysql.createPool({
    connectionLimit : 10, //pool에담을수있는최대인자수
    host     : 'localhost',
    user     : 'a',
    password : '1234',
    database : 'test1',
    debug    :  false
  });


  //list접속하면 list.ejs보여준다
  route.get( '/mlist', function(req, res){
   fs.readFile('views/mlist.ejs', 'utf8', function(error, data){
      if(error){
          console.log('readFile Error');
      }else{
          //전제 데이타를 조회한 후 결과를 'results' 매개변수에 저장한다.
          pool.query('select * from users', function(error, results){
              if(error){
                  console.log('error : ', error.message);
              }else{
                  //조회결과를 'prodList' 변수에 할당한 후 'list.ejs' 에 전달한다.
                  res.send( ejs.render(data, {
                      prodList : results }
                  ));
              }
          });
      }
   })
  });

  //삭제  localhost:3000/delete/3같은 거에서 id=3인 row 삭제
  route.get('/delete/:id',function(req, res){
    pool.query('delete from users where id = ?', [req.params.id],
  function(error, results){
    if(error){
      console.log('delete Error');
    }else{
      console.log('delete id = %d', req.params.id);
      res.redirect('/mlist');
    }
  });
});

//수정  localhost:3000/delete/3같은 거에서 id=3인 row 수정
route.get('/edit/:id', function(req, res){
   fs.readFile('views/edit.ejs', 'utf8', function(error, data){
      pool.query('select * from users where id = ?', [req.params.id],
          function(error, result){
             if(error){
                console.log('readFile Error');
             }else{
                res.send( ejs.render(data, {
                    product : result}
                  ));
             }
          }
      );
   })
});


app.use(bodyParser.urlencoded({extended:true}));

//'edit.ejs' 에서 POST 방식으로 전달되는 변경된 데이타를 MySQL에 업데이트한다.
route.post('/edit/:id', function(req, res){
  var id = req.body.id;
  console.log("id@@@@@"+req.body.id);
   pool.query('update users set phonenum=?, email=? where username=?',
       [req.body.phonenum, req.body.email, req.body.id ],
        function(error, result){
            if(error){
                console.log('update error : ', error.message );
            }else{
                res.redirect('/mlist'); //업데이트 완료 후 메인화면으로 이동한다.(변경사항 확인)
            }
   });
});
    return route;

};
