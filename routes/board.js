module.exports = function(app){

var express = require('express');
//라우터객체생성
var route = express.Router();
var fs = require('fs');
var mysql      = require('mysql'); //mysql모듈불러오기
var ejs = require('ejs');
  var bodyParser = require('body-parser');



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
      res.redirect('/board/blist/1');
    }else{
      res.redirect('/board/blistuser/1');
  }
  }
});


route.get('/blist/:page', function(req,res,next){

    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var boardselect = "SELECT idx, creator_id, title, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate,hit FROM board";
        connection.query(boardselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));

            res.render('blist', {title: '게시판 전체 글 조회', rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
});


route.get('/blistuser/:page', function(req,res,next){

    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var boardselect = "SELECT idx, creator_id, title, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate,hit FROM board";
        connection.query(boardselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));

            res.render('blistuser', {title: '게시판 전체 글 조회', rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
});


app.use(bodyParser.urlencoded({extended:true}));

// 글쓰기 화면 표시 GET
route.get('/write', function(req,res,next){
  var u_id = req.user.username;  //user가패스포트값불러오기
  console.log(u_id);
    res.render("./write", {u_id : u_id});   //json방식으로 변수선언해서부르기  렌터로는 값보내기
});


route.post('/write', function(req,res,next){

    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [creator_id,title,content,passwd];

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var boardinsert = "insert into board(creator_id, title, content, passwd) values(?,?,?,?)";
        connection.query(boardinsert,datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.redirect('/board');
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });

});




//글 조회
route.get('/read/:idx',function(req,res,next)
{
    var idx = req.params.idx;

    pool.getConnection(function(err,connection)
    {
        var sql = "select idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, hit from board where idx=?";
        //var sql2 = "update board set hit = hit + 1 WHERE idx = ?";
        connection.query(sql, [idx], function(err,row)
        {

            console.log("idx@@@@@"+idx);
            var sql2 = connection.query("update board set hit = hit + 1 WHERE idx = ?", idx,function(err, rows, fields){
              console.log('ok?');

                        });
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ",row);
            
            if(req.user && req.user.displayName){ //정보불러옴
              if(req.user.username == 'admin'){
            res.render('read', {title:"글 조회", row:row[0]});
            }else{
            res.render('readuser', {title:"글 조회", row:row[0]});
            }
          }
            connection.release();
        })
    });
});




//수정
route.get('/update',function(req,res,next)

{
    var idx = req.query.idx;

    pool.getConnection(function(err,connection)
    {
        if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

        var sql = "select idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, hit from board where idx=?";
        connection.query(sql, [idx], function(err,rows)
        {
            if(err) console.error(err);
            console.log("update에서 1개 글 조회 결과 확인 : ",rows);
            res.render('update', {title:"글 수정", row:rows[0]});
            connection.release();
        });
    });

});

route.post('/update',function(req,res,next)
{
    var idx = req.body.idx;
    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var passwd = req.body.passwd;
    var datas = [creator_id,title,content,passwd];

    pool.getConnection(function(err,connection)
    {
        var sql = "update board set creator_id=? , title=?,content=?, regdate=now() where idx=? and passwd=?";
        connection.query(sql,[creator_id,title,content,idx,passwd],function(err,result)
        {
            console.log(result);
            if(err) console.error("글 수정 중 에러 발생 err : ",err);

            if(result.affectedRows == 0)
            {
                res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 값이 변경되지 않았습니다.');history.back();</script>");
            }
            else
            {
                res.redirect('/board/read/'+idx);
            }
            connection.release();
        });
    });
});

//게시판삭제  localhost:3000/board/delete/3같은 거에서 idx=3인 row 삭제
route.get('/delete/:idx',function(req, res){
  pool.query('delete from board where idx = ?', [req.params.idx],
function(error, results){
  if(error){
    console.log('delete Error');
  }else{
    console.log('delete idx = %d', req.params.idx);
    res.redirect('/board');
  }
});
});


////////////////////////////////////////////////////////////////user꺼

route.get('/blistuser/:page', function(req,res,next){

    pool.getConnection(function (err, connection) {
        // Use the connection
        var boardselect = "SELECT idx, creator_id, title, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate,hit FROM board";
        connection.query(boardselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));
            res.render('blistuser', {title: ' 게시판 전체 글 조회', rows: rows});
            connection.release();

          }
        });
    });
});





return route;

};
