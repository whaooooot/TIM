module.exports = function(app){

var express = require('express');
//라우터객체생성
var route = express.Router();
var fs = require('fs');
var mysql      = require('mysql'); //mysql모듈불러오기
var ejs = require('ejs');
  var bodyParser = require('body-parser');
  var multipart = require('multiparty');



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


/* GET users listing. */
route.get('/', function(req, res, next) {
  if(req.user && req.user.displayName){ //정보불러옴
    if(req.user.username == 'admin'){
      res.redirect('/movieboard/mvlist/1');
    }else{
      res.redirect('/movieboard/mvlistuser/1');
  }
  }
});




route.get('/mvlist/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var movieselect = "SELECT idx, moviek, moviee, poster FROM movie";
        connection.query(movieselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));

            res.render('mvlist', {title: '게시판 전체 글 조회', u_id:u_id,rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


route.get('/mvlistuser/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var mapselect = "SELECT idx, moviek, moviee, poster  FROM movie";
        connection.query(mapselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));

            res.render('mvlistuser', {title: '게시판 전체 글 조회', u_id:u_id,rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


app.use(bodyParser.urlencoded({extended:true}));

// 글쓰기 화면 표시 GET
route.get('/mvwrite', function(req,res,next){
  var u_id = req.user.username;  //user가패스포트값불러오기
  console.log(u_id);
    res.render("./mvwrite", {u_id : u_id});   //json방식으로 변수선언해서부르기  렌터로는 값보내기
});


route.post('/mvwrite', function(req,res,next){

    var moviek = req.body.moviek;
    var moviee = req.body.moviee;
    var poster = req.body.poster;
    var datas = [moviek,moviee,poster];

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var movieinsert = "insert into movie(moviek, moviee, poster) values(?,?,?)";
        connection.query(movieinsert, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.redirect('/movieboard');
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });

});




//글 조회
route.get('/mvread/:idx',function(req,res,next)
{  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var idx = req.params.idx;

    pool.getConnection(function(err,connection)
    {
        var sql = "select idx, moviek, moviee, poster from movie where idx=?";
        //var sql2 = "update board set hit = hit + 1 WHERE idx = ?";
        connection.query(sql, [idx], function(err,row)
        {
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ",row);

            if(req.user && req.user.displayName){ //정보불러옴
              if(req.user.username == 'admin'){
            res.render('mvread', {title:"글 조회", u_id:u_id,row:row[0]});
            }else{
            res.render('mvreaduser', {title:"글 조회", u_id:u_id,row:row[0]});
            }
          }
            connection.release();
        })
    });
}
});



//게시판삭제  localhost:3000/board/delete/3같은 거에서 idx=3인 row 삭제
route.get('/delete/:idx',function(req, res){
  pool.query('delete from movie where idx = ?', [req.params.idx],
function(error, results){
  if(error){
    console.log('delete Error');
  }else{
    console.log('delete idx = %d', req.params.idx);
    res.redirect('/movieboard');
  }
});
});


////////////////////////////////////////////////////////////////user꺼



route.post('/mvlist/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    var id = req.user.id;

    pool.getConnection(function (err, connection) {
        // Use the connection
        var searchWord = req.body.searchWord;
          var search = "SELECT idx, moviek, moviee, poster  FROM movie where moviek=? ";
      connection.query(search, [searchWord],  function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));
            console.log("searchWord : " + JSON.stringify(searchWord));
            res.render('mvlist', {title: '게시판 전체 글 조회', id:id, u_id:u_id,  rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


route.post('/mvlistuser/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    var id = req.user.id;

    pool.getConnection(function (err, connection) {
        // Use the connection
        var searchWord = req.body.searchWord;
          var search = "SELECT idx, moviek, moviee, poster  FROM movie where moviek=? ";
      connection.query(search, [searchWord],  function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));
            console.log("searchWord : " + JSON.stringify(searchWord));
            res.render('mvlistuser', {title: '게시판 전체 글 조회', id:id, u_id:u_id,  rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


return route;

};
