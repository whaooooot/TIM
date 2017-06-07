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
      res.redirect('/mapboard/dmlist/1');
    }else{
      res.redirect('/mapboard/dmlistuser/1');
  }
  }
});


route.get('/dmlist/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    pool.getConnection(function (err, connection) {

        // Use the connection
        var mapselect = "SELECT idx, zzlat, zzlon, location, movie FROM map";
        connection.query(mapselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));
             var json = JSON.stringify(rows);

            res.render('dmlist', {title: '게시판 전체 글 조회',json, u_id:u_id,rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


route.get('/dmlistuser/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var mapselect = "SELECT idx, zzlat, zzlon, location, movie  FROM map";
        connection.query(mapselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));

            res.render('dmlistuser', {title: '게시판 전체 글 조회', u_id:u_id,rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


app.use(bodyParser.urlencoded({extended:true}));

// 글쓰기 화면 표시 GET
route.get('/dmwrite', function(req,res,next){
  var u_id = req.user.username;  //user가패스포트값불러오기
  console.log(u_id);
    res.render("./dmwrite", {u_id : u_id});   //json방식으로 변수선언해서부르기  렌터로는 값보내기
});


route.post('/dmwrite', function(req,res,next){

    var zzlat = req.body.zzlat;
    var zzlon = req.body.zzlon;
    var location = req.body.location;
    var movie = req.body.movie;
    var datas = [zzlat,zzlon,location,movie];

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var boardinsert = "insert into map(zzlat, zzlon, location, movie) values(?,?,?,?)";
        connection.query(boardinsert, datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.redirect('/mapboard');
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });

});




//글 조회
route.get('/dmread/:idx',function(req,res,next)
{  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var idx = req.params.idx;

    pool.getConnection(function(err,connection)
    {
        var sql = "select idx, zzlat, zzlon, location, movie from map where idx=?";
        //var sql2 = "update board set hit = hit + 1 WHERE idx = ?";
        connection.query(sql, [idx], function(err,row)
        {
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ",row);

            if(req.user && req.user.displayName){ //정보불러옴
              if(req.user.username == 'admin'){
            res.render('dmread', {title:"글 조회", u_id:u_id,row:row[0]});
            }else{
            res.render('dmreaduser', {title:"글 조회", u_id:u_id,row:row[0]});
            }
          }
            connection.release();
        })
    });
}
});



//게시판삭제  localhost:3000/board/delete/3같은 거에서 idx=3인 row 삭제
route.get('/delete/:idx',function(req, res){
  pool.query('delete from map where idx = ?', [req.params.idx],
function(error, results){
  if(error){
    console.log('delete Error');
  }else{
    console.log('delete idx = %d', req.params.idx);
    res.redirect('/mapboard');
  }
});
});


////////////////////////////////////////////////////////////////user꺼



route.get('/search', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var searchWord = req.body.searchWord;
        var search = "SELECT title FROM map";
        connection.query(search, searchWord,  function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));
            console.log("searchWord : " + JSON.stringify(searchWord));
            res.render('dmlist', {title: '게시판 전체 글 조회', u_id:u_id, title:searchWord,  rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});



return route;

};
