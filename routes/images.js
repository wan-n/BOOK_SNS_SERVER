var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');


router.get('/', (req,res,next) => {
    res.send('images page');
});



var _storage = multer.diskStorage({
    destination: function(req, file ,callback){
        callback(null, '/home/hosting_users/instabookadmin/apps/instabookadmin_instabookadmin/uploads/')
    },
    filename: (req, file, callback) =>{
        callback(null, file.originalname);  //전송자가 보낸 원래 이름으로 저장
    }
});



//프로밀 이미지 업로드
router.post('/upload', multer({storage: _storage}).single('upload'), function(req, res){

    try{
        let file = req.file;
        let originalName = '';
        let fileName = '';
        let mimeType = '';
        let size = 0;

        //파일이 넘어왔으면
        if(file){ 
            originalName = file.originalname;    //안스에서 지정해준 이름(사용자 아이디)
			filename = file.fileName;
			mimeType = file.mimetype;
			size = file.size;
			console.log("execute"+fileName);
        }else{
            console.log("request is null");
        }
    }catch(err){
        console.dir(err.stack);
    }

    
    console.log(req.file);
	console.log(req.body);
	//res.redirect("/home/hosting_users/instabookadmin/apps/instabookadmin_instabookadmin/uploads/" + req.file.originalname);   //경로 재설정 -> uploads/UserUID.jpg

	res.status(200).json({completed: 'true'});
});


//프로필 이미지 불러오기
router.get("/getimg", function(req, res){

	console.log("이미지요청");
	console.log(req.query);
	let filename = req.query.useruid +".jpg";
    let filePath = "/home/hosting_users/instabookadmin/apps/instabookadmin_instabookadmin/uploads/" + filename;
    
    let basicPath = "/home/hosting_users/instabookadmin/apps/instabookadmin_instabookadmin/uploads/basic.jpg";

	fs.readFile(filePath,
		function (err, data)
        {	
			if(err){
                console.log("이미지 받아올 수 없음");
                console.log(err);
                fs.readFile(basicPath,
                    function (err, data)
                    {	
                        if(err){
                            console.log("기본 이미지 불러오기 실패");
                            console.log(err);
                        }else{
                            console.log("기본 이미지 전송");
                            console.log(basicPath);
                            console.log(data);
                            res.end(data);
                        }
                    });
				}else{
                console.log("이미지 전송됨");
				console.log(filePath);
				console.log(data);
				res.end(data);    //읽어온 파일 전송
				}				
            }
		);
});


//기본 이미지로 변경
router.delete("/delimg", function(req, res){
    console.log("기본 이미지로 변경");
    
    let filePath = '/home/hosting_users/instabookadmin/apps/instabookadmin_instabookadmin/uploads/'+req.query.useruid+'.jpg'
    let basicPath = "/home/hosting_users/instabookadmin/apps/instabookadmin_instabookadmin/uploads/basic.jpg";

    
    fs.readFile(filePath,
		function (err, data)
        {	
			if(err){
                console.log("이미지 받아올 수 없음");
                console.log(err);
                fs.readFile(basicPath,
                    function (err, data)
                    {	
                        if(err){
                            console.log("기본 이미지 불러오기 실패");
                            console.log(err);
                        }else{
                            console.log("기본 이미지 전송");
                            console.log(basicPath);
                            console.log(data);
                            res.end(data);
                        }
                    });
				}else{
                console.log("이미지 삭제됨");
				console.log(filePath);
				console.log(data);
				fs.unlink(filePath, function(err){
                    if(err){
                        console.log(err);
                        throw err;
                    }
                    console.log('file deleted');
                })
                fs.readFile(basicPath,
                    function (err, data)
                    {	
                        if(err){
                            console.log("기본 이미지 불러오기 실패");
                            console.log(err);
                        }else{
                            console.log("기본 이미지 전송");
                            console.log(basicPath);
                            console.log(data);
                            res.end(data);
                        }			
                    });
			}				
        }
	);

});



//모듈에 등록해야 web.js에서 app.use 함수를 통해서 사용 가능
module.exports = router;