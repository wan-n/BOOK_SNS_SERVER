var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

//라우터의 get()함수를 이용해 request URL('/')에 대한 업무처리 로직 정의
router.get('/', function(req, res, next) {
    res.send('index page');
});


var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

var sql = require('mssql');

var config = {
  "user": "dogok0532_master", 
  "password": "password1!",
  "server": "sql16ssd-009.localnet.kr",
  "database": "dogok0532_master",
  "options": {
      "encrypt": true,
      "enableArithAbort" : true,
      "trustServerCertificate": true
  }
}

//DB 연결
sql.connect(config, err => { 
    if(err){
        console.log(err);
    }
    console.log("Connection Successful !");


    //CREATE TAG IN ReviewActivity
    router.post('/instabook/reviews/tag',function(req, res, nest) {

        let tag = new sql.Request(); 
        tag.input('input_tag', req.query.tag); 
        tag.input('input_ruid', req.query.ruid);
        tag.query('INSERT INTO BookTag(ReviewUID, Tag) VALUES (@input_ruid, @input_tag)', (err, result) => {
        
        res.status(200).json({completed: 'true'});
        console.log(req.query.tag);
        });
    });


    //CREATE USERINFO IN RegisterActivity
    router.post('/instabook/userinfo', function(req, res, next) {

        let user_uid;

        let isdel = 0; //삭제 여부
        let get_uid; 
        
        let info = new sql.Request();
        info.input('input_parameter_userid', req.body.id);
        info.input('input_parameter_isdel', isdel);
        info.query("INSERT INTO UserInfo (UserID, NickName, isDeleted) VALUES (@input_parameter_userid, @input_parameter_userid, @input_parameter_isdel) select @@Identity as 'iden'", (err, result) => {
            console.dir(result);
            get_uid = result.recordset[0].iden;


            let userpub = 1;  //공개 여부, 1 = 공개, 0 = 비공개
            //null 값 대신 들어갈 데이터(필요 없는 값)
            let charnull = 'n';
            let intnull = 0;

            let pinfo = new sql.Request();
            pinfo.input('input_parameter_useruid', get_uid);
            pinfo.input('input_parameter_userid', req.body.id);
            pinfo.input('input_parameter_userpwd', req.body.pwd);
            pinfo.input('input_parameter_useremail', req.body.email);
            pinfo.input('input_parameter_pwdquestionuid', req.body.pwdQuestionUID);
            pinfo.input('input_parameter_pwdanswer', req.body.pwdAnswer);
            pinfo.input('input_parameter_ispublic', userpub);
            pinfo.input('input_charnull', charnull);
            pinfo.input('input_intnull', intnull);
            pinfo.query('INSERT INTO PrivateUserInfo (UserUID, Email, Name, Gender, Password, Phone, PasswordAnswer, isPublic, PasswordQuestionUID) VALUES (@input_parameter_useruid, @input_parameter_useremail, @input_charnull, @input_charnull, @input_parameter_userpwd, @input_charnull, @input_parameter_pwdanswer, @input_parameter_ispublic, @input_parameter_pwdquestionuid)', (err, result) => {
            console.dir(result)
            });

        });

        res.status(200).json({completed: 'true'});
        console.log('send complete!!');
    });


    //CREATE USERINFO IN SearchFriendActivity
    router.post('/instabook/users/request', function(req, res, next) {
        
        let user_uid;
        let friend_uid;

        let info = new sql.Request();
        info.input('input_userid', req.body.user_id);
        info.query('SELECT UserUID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            console.dir(result)
            user_uid = result.recordset[0].UserUID;

            let info2 = new sql.Request();
            info2.input('input_friendname', req.body.friend_name);
            info2.query('SELECT UserUID FROM UserInfo WHERE NickName = @input_friendname', (err, result) => {
                console.dir(result)
                friend_uid = result.recordset[0].UserUID;

                let info3 = new sql.Request();
                info3.input('input_useruid', user_uid);
                info3.input('input_frienduid', friend_uid);
                info3.query('INSERT INTO FriendRequest (UserUID, FriendUID) VALUES (@input_frienduid, @input_useruid)', (err, result) => {
                    console.dir(result)

                });

            });

        });

        res.status(200).json({completed: 'true'});
        console.log('send complete!!');

    });


     //CREATE FRIEND IN RequestFriendAdapter
     router.post('/instabook/users/flist', function(req, res, next) {

        let u_uid;
        let f_uid;
            
        let info = new sql.Request();
         info.input('input_userid', req.body.id);
          info.query('SELECT UserUID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            console.dir(result)
            u_uid = result.recordset[0].UserUID;

            let info2 = new sql.Request();
            info2.input('input_fname', req.body.name);
            info2.query('SELECT UserUID FROM UserInfo WHERE NickName = @input_fname', (err, result) => {
                  console.dir(result)
                  f_uid = result.recordset[0].UserUID;

                let info3 = new sql.Request();
                info3.input('input_uuid', u_uid);
                info3.input('input_fuid', f_uid);
                info3.query('INSERT INTO FriendList (UserUID, FriendUID) VALUES (@input_uuid, @input_fuid), (@input_fuid, @input_uuid)', (err, result) => {
                        console.dir(result)

                });
                info3.query('DELETE FROM FriendRequest WHERE UserUID = @input_uuid AND FriendUID = @input_fuid', (err, result) => {
                console.dir(result)

                });

            });

        });

        res.status(200).json({completed: 'true'});
        console.log('send complete!!');
    });
        

    //CREATE USERBOOK IN recmdadapter
    router.post('/instabook/users/userbook', function(req, res, next) {

        let ubook = new sql.Request();
        ubook.input('input_uid', req.body.uid);
        ubook.input('input_isbn', req.body.isbn);
        ubook.query("INSERT INTO UserBook (UserUID, ISBN13, isFinished) VALUES (@input_uid, @input_isbn, 0)", (err, result) => {
        
            console.dir(result)
        });

        res.status(200).json({completed: 'true'});
        console.log('userbook create complete!!');
    });


    //CREATE ReviewUID IN ReviewActivity
    router.post('/instabook/reviews/uid', function(req, res, next) {

        let isdel = 0; //삭제 여부
        let review = new sql.Request();

        review.input('input_review', req.body.Review);
        review.input('input_isbn', req.body.ISBN13);
        review.input('input_uid', req.body.UserUID);
        review.input('input_rate', req.body.Rate);
        review.input('input_isdel', isdel);

        review.query("INSERT INTO BookReview (UserUID, ISBN13, Rate, Review, ReviewDate, isDeleted) VALUES (@input_uid, @input_isbn, @input_rate, @input_review, SYSDATETIME(), @input_isdel)", (err, result) => {
        
            console.dir(result)

            let review2 = new sql.Request();
            review2.input('input_isbn', req.query.isbn);
            review2.query("SELECT IDENT_CURRENT('BookReview') as ReviewUID", (err, result) => {
                //select 결과가 없을 경우
                if(result.recordset[0] == null){
                    console.log('error!!')
                    res.status(200);
                    res.end();
                }

                //결과 반환
                else{
                    console.dir(result);
                    res.status(200).json(result.recordset);
                    res.end();
                }

            })


        });


        console.log('complete!!');
    });


    //CREATE BOOKINFO IN SEARCHSUBACTIVITY
    router.post('/instabook/books/naverbook', function(req, res, next) {

        let info = new sql.Request();
        info.input('input_bname', req.body.bookname);
        info.input('input_isbn', req.body.isbn);
        info.input('input_pub', req.body.pub);
        info.input('input_pdate', req.body.pdate);
        info.input('input_price', req.body.price);
        info.input('input_sale', req.body.sale);
        info.input('input_img',req.body.img);
        info.query("INSERT INTO BookInfo (ISBN13, BookName, Publisher, PublishDate, BookPrice, SalePrice, Yes24Code, BookImageUrl) VALUES (@input_isbn ,@input_bname, @input_pub, @input_pdate, @input_price, @input_sale, -1, @input_img)", (err, result) => {
            
            console.dir(result)

            let info2  = new sql.Request();
            info2.input('input_author',req.body.author);
            info2.input('input_isbn13',req.body.isbn);
            info2.query("INSERT INTO AuthorInfo (ISBN13, Author) VALUES (@input_isbn13, @input_author)", (err, result) => {
            
                console.dir(result)
            });
        });

        res.status(200).json({completed: 'true'});
        console.log('send complete!!');
    });


    //READ USERS ID&PWD IN LoginActivity
    router.get('/instabook/users/info', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_userid', req.query.userid);
        search.query('SELECT U.UserUID, U.UserID, U.NickName, P.Password, P.Email FROM UserInfo U FULL OUTER JOIN PrivateUserInfo P ON U.UserUID = P.UserUID WHERE UserID = @input_userid AND isDeleted = 0', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
            
        })
        
        console.log('complete!!');
    });


    //READ RECMDBOOK ID IN RECNDFRAGMENT
    router.get('/instabook/rcmbook', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_uid', req.query.useruid);
        search.query("SELECT BookName, Publisher, BookImageUrl, ISBN13 FROM BookInfo WHERE ISBN13 IN (SELECT ISBN13 FROM RecommandBook)", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                console.dir(result);
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
            
        })
        
        console.log('RCM complete!!');
    });


    //READ USERS ID IN RegisterActivity
    router.get('/instabook/users/userid', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_userid', req.query.userid);
        search.query('SELECT UserID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                console.dir(result);
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
            
        })
        
        console.log('complete!!');
    });


    //SEND MAIL
    router.get('/instabook/users/useremail', function(req, res, next) {

        let email = req.query.email;  //사용자가 입력한 이메일 주소
        let search = new sql.Request();
        let selectdata;

        search.input('input_useremail', email);
        search.query('SELECT U.UserID FROM UserInfo U FULL OUTER JOIN PrivateUserInfo P ON U.UserUID = P.UserUID WHERE P.Email = @input_useremail', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                console.dir(result);
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                selectdata = result.recordset[0].UserID;
                console.log(selectdata);
                sendUserId(selectdata, email);
                res.status(200).json(result.recordset);
            }
            
        });


        function sendUserId(selectdata, email){
        
            let transporter = nodemailer.createTransport({
                service: 'naver',
                auth: {
                    user: 'ksoo1916@naver.com',
                    pass: 'password1!naver'
                }
            });

            let mailOptions = {
                from: 'ksoo1916@naver.com',
                to: email,
                subject: 'InstaBook - Check your ID',
                text: 'Your ID :  ' + selectdata
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                }
                else {
                console.log('Email sent: ' + info.response);
                res.status(200);
                }
            });
        }
        
    });


    //READ QUESTION&ANSWER IN FindPwdActivity
    router.get('/instabook/users/userpwd', function(req, res, next) {
        let search = new sql.Request();
        search.input('input_userid', req.query.userid);
        search.query('SELECT P.PasswordQuestionUID, P.PasswordAnswer FROM UserInfo U FULL OUTER JOIN PrivateUserInfo P ON U.UserUID = P.UserUID WHERE UserID = @input_userid', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
            
        })
        
        console.log('complete!!');
    });


    //READ EMAIL IN MyInfoActivity
    router.get('/instabook/users/userinfo', function(req, res, next) {
        let search = new sql.Request();
        search.input('input_userid', req.query.userid);
        search.query('SELECT P.Email FROM UserInfo U FULL OUTER JOIN PrivateUserInfo P ON U.UserUID = P.UserUID WHERE UserID = @input_userid', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
            
        })
        
        console.log('complete!!');
    });
    

    //READ NICKNAME IN SearchFriendActivity
    router.get('/instabook/users/nickname', function(req, res, next) {
        let search = new sql.Request();
        let u_uid;
        let f_uid;

        search.input('input_userid', req.query.userid);
        search.query('SELECT UserUID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            console.dir(result);
            u_uid = result.recordset[0].UserUID;
                let search4 = new sql.Request();
                search4.input('input_uuid', u_uid);
                search4.query("SELECT DISTINCT UserUID, NickName FROM UserInfo WHERE UserUID NOT IN (select FriendUID from FriendRequest where UserUID = @input_uuid) AND UserUID NOT IN (select FriendUID from FriendList where UserUID = @input_uuid) AND isDeleted = 0 AND UserUID  NOT IN (@input_uuid) AND isDeleted = 0 AND NickName like '%"+req.query.nickname+"%'", (err, result) => {
                    //select 결과가 없을 경우
                    if(result.recordset[0] == null){
                           console.log('error!!')
                            res.status(200);
                            res.end();
                        }
                        //결과 반환
                        else{
                            console.dir(result);
                            res.status(200).json(result.recordset);
                            res.end();
                        }
                        
                 });

        });
        
        console.log('complete!!');
    });


    //READ REQ IN FRequestFragment
    router.get('/instabook/users/req', function(req, res, next) {

        console.log(req.query.userid);

        let get_uid;

        let search = new sql.Request();
        search.input('input_userid', req.query.userid);
        search.query('SELECT UserUID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            console.dir(result);
            get_uid = result.recordset[0].UserUID;


            let search2 = new sql.Request();

            search2.input('input_useruid', get_uid);
            search2.query("SELECT U.NickName, U.UserUID FROM UserInfo U LEFT JOIN FriendRequest R ON U.UserUID = R.FriendUID WHERE R.UserUID = @input_useruid AND U.isDeleted = 0", (err, result) => {
                //select 결과가 없을 경우
                if(result.recordset[0] == null){
                    console.log('error!!')
                    res.status(200);
                    res.end();
                }
                //결과 반환
                else{
                    console.dir(result);
                    res.status(200).json(result.recordset);
                    res.end();
                }
            
            })

        });

        console.log('complete!!');
    });


    //READ FRIEND IN FListFragment
    router.get('/instabook/users/friend', function(req, res, next) {

        let get_uid;

        let search = new sql.Request();
        search.input('input_userid', req.query.userid);
        search.query('SELECT UserUID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            console.dir(result);
            get_uid = result.recordset[0].UserUID;

            let search2 = new sql.Request();
            search2.input('input_useruid', get_uid);
            search2.query("SELECT DISTINCT NickName, UserUID FROM UserInfo WHERE UserUID IN (SELECT FriendUID FROM FriendLIST WHERE UserUID = @input_useruid) AND isDeleted = 0", (err, result) => {
                //select 결과가 없을 경우
                if(result.recordset[0] == null){
                    console.log('error!!')
                    res.status(200);
                    res.end();
                }
                //결과 반환
                else{
                    console.dir(result);
                    res.status(200).json(result.recordset);
                    res.end();
                }

            })

        });

        console.log('complete!!');
    });


    //READ PUB IN SettingMenuActivity
    router.get('/instabook/users/pub', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_userid', req.query.userid);
        search.query('SELECT isPublic FROM PrivateUserInfo WHERE UserUID IN (SELECT UserUID FROM UserInfo WHERE UserID = @input_userid)', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }

        })

        console.log('complete!!');
    });



    //READ NICKNAME IN LinkActivity
    router.get('/instabook/users/info/nickname', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_useruid', req.query.useruid);
        search.query('SELECT NickName FROM UserInfo WHERE UserUID = @input_useruid', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('complete!!');
    });


    //READ REVIEW IN LinkActivity
    router.get('/instabook/review', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_rvuid', req.query.reviewuid);
        search.query('SELECT R.Rate, R.Review, R.ReviewDate, R.isDeleted, I.BookName FROM BookReview R FULL OUTER JOIN BookInfo I ON R.ISBN13 = I.ISBN13 WHERE ReviewUID = @input_rvuid', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('complete!!');
    });



    //READ REVIEW_CNT IN InfoFragment
    router.get('/instabook/reviews/count', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_useruid', req.query.useruid);
        search.query('select count(UserUID) as ReviewCnt from BookReview where UserUID = @input_useruid AND isDeleted = 0', (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('complete!!');
    });


    //READ DUP_NICKNAME IN InfoFragment
    router.get('/instabook/users/info/name', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_editname', req.query.username);
        search.query('SELECT NickName FROM UserInfo WHERE NickName = @input_editname', (err, result) => {
            //select 결과가 없을 경우 - 중복된 닉네임이 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }

        })

        console.log('complete!!');
    });


    //READ BOOKINFO IN SearchdbActivity
    router.get('/instabook/books/info', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_keyword', req.query.keyword);
        search.query("SELECT B.BookName, B.ISBN13, B.Publisher, B.BookImageUrl FROM BookInfo B WHERE BookName like '%"+req.query.keyword+"%'", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }

        })

        console.log('complete!!');
    });


    //READ AUTHOR IN SearchdbActivity
    router.get('/instabook/books/author', function(req, res, next) {

        let author = new sql.Request();
        author.input('input_isbn', req.query.isbn);
        author.query("SELECT Author FROM AuthorInfo WHERE ISBN13 = @input_isbn", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }

            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }

        })

        console.log('complete!!');
    });


    //READ  FriendUID IN HomeFragment
    router.get('/instabook/reviews/uid', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_useruid', req.query.UserUID);
        search.query("SELECT FriendUID FROM FriendList WHERE UserUID = @input_useruid AND FriendUID IN (SELECT UserUID FROM PrivateUserInfo WHERE isPublic = 1) ", (err, result) => {
            //select 결과가 없을 경우 - 친구가 없을 경우
            if(result.recordset[0] == null){
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.log('user: '+ req.query.UserUID);
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }

        })

        console.log('complete!!');
    });


    //READ USER & REVIEW & BOOK IN HomeFragment
    router.get('/instabook/reviews/home', function(req, res, next) {
        let search = new sql.Request();
        search.input('input_useruid', req.query.useruid);
        search.query("SELECT BR.UserUID, BR.ReviewUID, BI.BookImageUrl, BR.Review, BR.ReviewDate, BR.ISBN13, BR.Rate, BI.BookName, UI.NickName FROM BookReview BR, BookInfo BI, UserInfo UI WHERE BR.UserUID = @input_useruid AND BR.isDeleted = 0 AND  BI.ISBN13 = BR.ISBN13 AND UI.UserUID = BR.UserUID ORDER BY BR.ReviewDate DESC", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
            
        })
        
        console.log('complete!!');
    });


    //READ  USERBOOKUID IN RECNDFRAGMENT
    router.get('/instabook/recmds/ubid', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_uid', req.query.uid);
        search.input('input_isbn', req.query.isbn);
        search.query("SELECT UserBookUID FROM UserBook WHERE ISBN13 = @input_isbn AND UserUID = @input_uid", (err, result) => {
            //select 결과가 없을 경우 - 소유 도서가 없을 경우
            if(result.recordset[0] == null){
                console.log(result);
                console.log("USERBOOK NOPE!!!");
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.log("USERBOOK YES!!!");
                console.dir(result);
                res.status(200).json(result.recordset[0]);
                res.end();
            }

        })

        console.log('get userbookuid complete!!');
    });
    

    //READ USERBOOKINFO IN MYBOOKACTIVITY
    router.get('/instabook/userbooks/ublist', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_uid', req.query.uid);
        search.query("SELECT UB.ISBN13, UB.UserBookUID, BI.BookImageUrl, BI.BookName, BI.Publisher FROM UserBook UB, BookInfo BI WHERE UB.ISBN13 = BI.ISBN13 AND UB.UserUID = @input_uid", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('complete!!');
    });


     //READ REVIEWTAG IN HOMEFRAGMENT
     router.get('/instabook/reviews/taglist', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_ruid', req.query.ruid);
        search.query("SELECT Tag FROM BookTag WHERE ReviewUID = @input_ruid", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('complete!!');
    });


     //READ REVIEWUID IN SEARCHTAGACTIVITY
     router.get('/instabook/search/ruids', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_key', req.query.key);
        search.query("SELECT BT.ReviewUID FROM BookTag BT WHERE Tag like '%"+req.query.key+"%'", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('ruid complete!!');
    });


    //READ TAG & ISBN IN SEARCHTAGACTIVITY
    router.get('/instabook/search/tags', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_ruid', req.query.ruid);
        search.query("SELECT BT.Tag, BR.ISBN13 FROM BookTag BT, BookReview BR WHERE BR.ReviewUID = BT.ReviewUID AND BT.ReviewUID = @input_ruid", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('tag complete!!');
    });
    

    //READ BOOKINGO IN SEARCHTAGACTIVITY
    router.get('/instabook/search/books', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_isbn', req.query.isbn);
        search.query("SELECT BI.BookImageUrl, BI.BookName, BI.Publisher, BI.PublishDate FROM BookInfo BI WHERE BI.ISBN13 = @input_isbn", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('book complete!!');
    });


    //READ USERBOOKUID IN SEARCHTAGACTIVITY
    router.get('/instabook/search/ubuid', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_isbn', req.query.isbn);
        search.input('input_uid', req.query.uid);
        search.query("SELECT UB.UserBookUID FROM UserBook UB WHERE UB.ISBN13 = @input_isbn AND UB.UserUID = @input_uid", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('userbookuid complete!!');
    });


    //READ AUTHOR IN SEARCHTAGACTIVITY
    router.get('/instabook/search/author', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_isbn', req.query.isbn);
        search.query("SELECT AI.Author FROM AuthorInfo AI WHERE AI.ISBN13 = '"+req.query.isbn+"'", (err, result) => {
            //select 결과가 없을 경우
            if(result.recordset[0] == null){
                console.log('error!!')
                res.status(200);
                res.end();
            }
            //결과 반환
            else{
                console.dir(result);
                res.status(200).json(result.recordset);
                res.end();
            }
        })
        console.log('isbn complete!!');
    });


    //UPDATE EMAIL IN MyInfoActivity
    router.put('/instabook/user/userinfo/email', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_useruid', req.query.useruid);
        search.input('input_useremail', req.query.email);
        search.query('UPDATE PrivateUserInfo SET Email = @input_useremail WHERE UserUID = @input_useruid', (err, result) => {
            console.dir(result)
        });

        res.status(200).json({completed: 'true'});
        console.log('complete!!');
    });



    //UPDATE PASSWORD IN FindPwdActivity
    router.put('/instabook/users/userpwd', function(req, res, next) {

        let search = new sql.Request();
        search.input('input_userpwd', req.body.pwd);
        search.input('input_userid', req.body.id);
        search.query('UPDATE PrivateUserInfo SET Password = @input_userpwd FROM PrivateUserInfo AS P FULL OUTER JOIN UserInfo AS U ON U.UserUID = P.UserUID WHERE UserID = @input_userid', (err, result) => {
            console.dir(result)
        });

        res.status(200).json({completed: 'true'});
        console.log('complete!!');
    });


    //UPDATE isDelete IN SettingMenuActivity
    router.put('/instabook/userinfo', function(req, res, next) {

        let delinfo = new sql.Request();

        delinfo.input('input_userid', req.query.userid);
        delinfo.query('UPDATE UserInfo SET isDeleted = 1 WHERE UserID = @input_userid', (err, result) => {
            console.dir(result)
        });

        res.status(200).json({completed: 'true'});
        console.log('complete!!');
    });


    //UPDATE PUB IN SettingMenuActivity
    router.put('/instabook/userinfo/pub', function(req, res, next) {

        let edit = new sql.Request();

        edit.input('input_userid', req.query.userid);
        edit.input('input_pub', req.query.userpub);
        edit.query('UPDATE PrivateUserInfo SET isPublic = @input_pub WHERE UserUID IN (SELECT UserUID FROM UserInfo WHERE UserID = @input_userid)', (err, result) => {
            console.dir(result)

        });

        res.status(200).json({completed: 'true'});
        console.log('complete!!');
    });


    //UPDATE NICKNAME IN InfoFragment
    router.put('/instabook/userinfo/name', function(req, res, next) {

        let edit = new sql.Request();

        edit.input('input_userid', req.query.userid);
        edit.input('input_name', req.query.username);
        edit.query('UPDATE UserInfo SET NickName = @input_name WHERE UserID = @input_userid', (err, result) => {
            console.dir(result)
            
        });

        res.status(200).json({completed: 'true'});
        console.log('complete!!');
    });


    //UPDATE REVIEW IN MODIREVIEWACTIVITY
    router.put('/instabook/reviews/modify', function(req, res, next) {

        let deltag  = new sql.Request();

        deltag.input('input_rid',req.query.rid);
        deltag.query("DELETE FROM BookTag WHERE ReviewUID = @input_rid", (err, result) => {
            
            console.dir(result)

            let edit = new sql.Request();

            edit.input('input_uid', req.body.UserUID);
            edit.input('input_rate', req.body.Rate);
            edit.input('input_review', req.body.Review);
            edit.input('input_isbn', req.body.ISBN13);

            edit.query("UPDATE BookReview SET Review = @input_review, ReviewDate = SYSDATETIME(), Rate = @input_rate WHERE UserUID = @input_uid AND ISBN13 = @input_isbn", (err, result) => {
                console.dir(result)
            });
        });

        res.status(200).json({completed: 'true'});
        console.log('complete!!');
    });


    //UBDATE REVIEW ISDELETED = 1 IN REVIEWDELACTIVITY
    router.put('/instabook/reviews/delete', function(req, res, next) {

        let edit = new sql.Request();

        edit.input('input_ruid', req.query.ruid);
        edit.query("UPDATE BookReview SET isDeleted = 1 WHERE ReviewUID = @input_ruid", (err, result) => {
            console.dir(result)
            
        });

        res.status(200).json({completed: 'true'});
        console.log('complete!!');
    });
    

    //not use
    //DELETE REVIEW IN REVIEWDELACTIVITY
    router.delete('/instabook/reviews/delrev', function(req, res, next) {

        let info = new sql.Request();
        info.input('input_uid', req.query.uid);
        info.input('input_isbn', req.query.isbn);
        info.query("DELETE FROM BookReview WHERE UserUID = @input_uid AND ISBN13 = @input_isbn", (err, result) => {
            console.dir(result)
            
        });

        res.status(200).json({completed: 'true'});
        console.log('send complete!!');
     });


    //DELETE USERBOOK IN RECMDADAPTER
    router.delete('/instabook/users/delubook', function(req, res, next) {

        let info = new sql.Request();
        info.input('input_ubid', req.query.ubid);
        info.query("DELETE FROM UserBook WHERE UserBookUID = @input_ubid", (err, result) => {
            console.dir(result)
            
        });

        res.status(200).json({completed: 'true'});
        console.log('USERBOOK DELETE complete!!');
     });


    //DELETE REQUEST IN RequestFriendAdapter
    router.delete('/instabook/users/request', function(req, res, next) {

        let u_uid;
        let f_uid;
        let info = new sql.Request();
        info.input('input_userid', req.query.userid);
        info.query('SELECT UserUID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            console.dir(result)
            u_uid = result.recordset[0].UserUID;
    
            let info2 = new sql.Request();
            info2.input('input_fname', req.query.fname);
            info2.query('SELECT UserUID FROM UserInfo WHERE NickName = @input_fname', (err, result) => {
                console.dir(result)
                f_uid = result.recordset[0].UserUID;
    
                let info3 = new sql.Request();
                info3.input('input_uuid', u_uid);
                info3.input('input_fuid', f_uid);
                info3.query('DELETE FROM FriendRequest WHERE UserUID = @input_uuid AND FriendUID = @input_fuid', (err, result) => {
                    console.dir(result)
    
                });
            
            });

        });

        res.status(200).json({completed: 'true'});
        console.log('send complete!!');
     });


    //DELETE FRIEND IN FriendListAdapter
    router.delete('/instabook/users/friend', function(req, res, next) {

        let u_uid;
        let f_uid;
        let info = new sql.Request();
        info.input('input_userid', req.query.userid);
        info.query('SELECT UserUID FROM UserInfo WHERE UserID = @input_userid', (err, result) => {
            console.dir(result)
            u_uid = result.recordset[0].UserUID;

            let info2 = new sql.Request();
            info2.input('input_fname', req.query.fname);
            info2.query('SELECT UserUID FROM UserInfo WHERE NickName = @input_fname', (err, result) => {
                console.dir(result)
                f_uid = result.recordset[0].UserUID;

                let info3 = new sql.Request();
                info3.input('input_uuid', u_uid);
                info3.input('input_fuid', f_uid);
                info3.query('DELETE FROM FriendList WHERE UserUID = @input_uuid AND FriendUID = @input_fuid', (err, result) => {
                    console.dir(result)

                });

                let info4 = new sql.Request();
                info4.input('input_uuid', u_uid);
                info4.input('input_fuid', f_uid);
                info4.query('DELETE FROM FriendList WHERE UserUID = @input_fuid AND FriendUID = @input_uuid', (err, result) => {
                    console.dir(result)

                });

           });

        });

        res.status(200).json({completed: 'true'});
        console.log('send complete!!');
    });

});


//모듈에 등록해야 web.js에서 app.use 함수를 통해서 사용 가능
module.exports = router;