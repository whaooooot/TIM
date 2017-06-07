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
      res.redirect('/travelboard/tlist/1');
    }else{
      res.redirect('/travelboard/tlistuser/1');
  }
  }
});




route.get('/tlist/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var boardselect = "SELECT idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate,hit,img,moviek FROM travel";
        connection.query(boardselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));

            res.render('tlist', {title: '게시판 전체 글 조회', u_id:u_id,rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


route.get('/tlistuser/:page', function(req,res,next){
  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var page = req.params.page;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var boardselect = "SELECT idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate,hit,img,moviek FROM travel";
        connection.query(boardselect, function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));

            res.render('tlistuser', {title: '게시판 전체 글 조회', u_id:u_id,rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});


app.use(bodyParser.urlencoded({extended:true}));

// 글쓰기 화면 표시 GET
route.get('/twrite', function(req,res,next){
  var u_id = req.user.username;  //user가패스포트값불러오기
  console.log(u_id);
    res.render("./twrite", {u_id : u_id});   //json방식으로 변수선언해서부르기  렌터로는 값보내기
});


route.post('/twrite', function(req,res,next){

    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var img = req.body.img;
    var moviek = req.body.moviek;
    var datas = [creator_id,title,content,img,moviek];

    pool.getConnection(function (err, connection)
    {
        // Use the connection
        var boardinsert = "insert into travel(creator_id, title, content, img, moviek) values(?,?,?,?,?)";
        connection.query(boardinsert,datas, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.redirect('/travelboard');
            connection.release();

            // Don't use the connection here, it has been returned to the pool.
        });
    });

});




//글 조회
route.get('/tread/:idx',function(req,res,next)
{  if(req.user && req.user.displayName){ //정보불러옴
    var u_id = req.user.username;
    var idx = req.params.idx;

    pool.getConnection(function(err,connection)
    {
        var sql = "select idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, hit,img,moviek from travel where idx=?";
        //var sql2 = "update board set hit = hit + 1 WHERE idx = ?";
        connection.query(sql, [idx], function(err,row)
        {

            console.log("idx@@@@@"+idx);
            var sql2 = connection.query("update travel set hit = hit + 1 WHERE idx = ?", idx,function(err, rows, fields){
              console.log('ok?');

                        });
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ",row);

            if(req.user && req.user.displayName){ //정보불러옴
              if(req.user.username == 'admin'){
            res.render('tread', {title:"글 조회", u_id:u_id,row:row[0]});
            }else{
            res.render('treaduser', {title:"글 조회", u_id:u_id,row:row[0]});
            }
          }
            connection.release();
        })
    });
}
});




//수정
route.get('/tupdate',function(req,res,next)

{
  if(req.user && req.user.displayName){ //정보불러옴
      var u_id = req.user.username;
    var idx = req.query.idx;

    pool.getConnection(function(err,connection)
    {
        if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

        var sql = "select idx, creator_id, title, content, date_format(modidate,'%Y-%m-%d %H:%i:%s') modidate, hit,img,moviek from travel where idx=?";
        connection.query(sql, [idx], function(err,rows)
        {
            if(err) console.error(err);
            console.log("update에서 1개 글 조회 결과 확인 : ",rows);
            res.render('tupdate', {title:"글 수정", row:rows[0],u_id:u_id});
            connection.release();
        });
    });
}});

route.post('/tupdate',function(req,res,next)
{
    var idx = req.body.idx;
    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var img = req.body.img;
    var moviek = req.body.moviek;
    var datas = [creator_id,title,content,img,moviek];

    pool.getConnection(function(err,connection)
    {
        var sql = "update travel set creator_id=? , title=?,content=?, regdate=now(),img=?,moviek=? where idx=? ";
        connection.query(sql,[creator_id,title,content,img,idx,moviek],function(err,result)
        {
            console.log(result);
            if(err) console.error("글 수정 중 에러 발생 err : ",err);

                res.redirect('/travelboard/tread/'+idx);

            connection.release();
        });
    });
});

//게시판삭제  localhost:3000/board/delete/3같은 거에서 idx=3인 row 삭제
route.get('/delete/:idx',function(req, res){
  pool.query('delete from travel where idx = ?', [req.params.idx],
function(error, results){
  if(error){
    console.log('delete Error');
  }else{
    console.log('delete idx = %d', req.params.idx);
    res.redirect('/travelboard');
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
        var search = "SELECT title FROM travel";
        connection.query(search, searchWord,  function (err, rows) {
            if (err){ console.error("err : " + err);}
            else{
            console.log("rows : " + JSON.stringify(rows));
            console.log("searchWord : " + JSON.stringify(searchWord));
            res.render('tlist', {title: '게시판 전체 글 조회', u_id:u_id, title:searchWord,  rows: rows, page: page, leng : Object.keys(rows).length-1, page_num:8, pass: true });
            connection.release();

          }
        });
    });
}
});



return route;

};
