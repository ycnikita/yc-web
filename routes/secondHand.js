var express =require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var multer= require('multer');
var upload = multer();
var uploadToQiniu = require("../utils/uploadImage");
var User = require('../model/user');
var Valueble = require('../model/valuable');
//   二手交易首页
router.get('/', function(req, res) {
  var crtUser = req.session.user;
  console.log(JSON.stringify(crtUser));
  var queryValueble = Valueble.find({'authorSchool': crtUser.school});
  queryValueble.sort([['_id', -1]]).exec(function(err, qs) {
    if (err) {
      console.log(err);
    }else {
      if (qs.length != 0) {
        console.log(
            "*******************logging from /secondHand--valueble transformed***************\n",
            qs.map(function(item) {
              return item.toObject({getters: true, virtuals: true});
            })
        );
        res.render("secondHandIndex", {
          title: "二手交易首页",
          valuebles: qs.map(function(item){
            return item.toObject({getters: true, virtuals: true});
          }),
          bookValuebles: qs.map(function(item){
            return item.toObject({getters: true, virtuals: true});
          }).filter(function(item, index) {
            return item.category == "book";
          }),
          beautyValuebles: qs.map(function(item){
            return item.toObject({getters: true, virtuals: true});
          }).filter(function(item, index) {
            return item.category == "beauty";
          }),
          eleValuebles: qs.map(function(item){
            return item.toObject({getters: true, virtuals: true});
          }).filter(function(item, index) {
            return item.category == "ele";
          }),
          otherValuebles: qs.map(function(item){
            return item.toObject({getters: true, virtuals: true});
          }).filter(function(item, index) {
            return item.category == "other";
          }),
          user: crtUser
        });
      }else {
        res.render("secondHandIndex", {
          title: "二手交易首页",
          valuebles: null,
          user: crtUser
        });
      }
    }
  })
})

// 二手交易发布页面
router.get('/post', function(req, res) {
  console.log("*************logging from /self************res.session.user", req.session.user);
  User.find({_id: req.session.user._id}, function(err, u) {
    if (err) {
      console.log(err);
    }else {
      console.log("*************logging from /self************userinfo", u[0]);
      res.render('secondHandPost', {
        userInfo: u[0],
        title: "发布"
      })

    }
  })
})


//  发布新的商品
router.post('/new', upload.single('test'), function(req, res) {
  console.log("*************logging from /secondHand/new--user***************", req.session.user);
  console.log("*************logging from /secondHand/new--req.body***************", req.body);
  var imageData = JSON.parse(req.body['imageData']);
  var name = req.body['name'];
  var desc = req.body['desc'];
  var price = parseInt(req.body['price']);
  var location = req.body['location'];
  var category = req.body['category'];
  var qq = req.body['qq'];
  var tel = req.body['tel'];
  var authorId = req.session.user._id;
  var time = Date.now();
  User.find({_id: authorId}, "name school avatarUrl", function(err, us) {
    if (err) {
      console.log(err);
    }else {
      var newValueble = new Valueble({
        author: authorId,
        authorName: us[0].name,
        authorAvatarUrl: us[0].avatarUrl,
        authorSchool: us[0].school,
        name: name,
        desc: desc,
        status: 0,
        location: location,
        category: category,
        qq: qq,
        tel: tel,
        time: time,
        price: price,
        view: 0
      })
      console.log("logging from ******************logging from /valueble/new --valuebltosave", newValueble);
      newValueble.save(function(err, v) {
        if (err) {
          console.log("save treehole error");
        }
        console.log("*******************logging from /treehole/new--valueble", v);
        imageData.forEach(function(item, index) {
          var base64Data = item.split(',')[1];
          var fileType = item.split(';')[0].split('/')[1];
          var dataBuffer = new Buffer(base64Data, 'base64');
          var picUrl = "http://obzokcbc0.bkt.clouddn.com/secondHand/" + time + "-" + index + "." + fileType;
          console.log("*****************logging from /secondHand/new--picUrl**************", picUrl);
          Valueble.update({time: time}, {$push: {"picUrl": picUrl}}, function(err, raw) {
            if (err) {
              console.log("保存secondHand url出错", err);
            }else {
              console.log(raw);
            }
          });
          var tmpFilePath = "./upload/tmp/" + time + "-" + index + "." + fileType;
          fs.writeFile(tmpFilePath, dataBuffer, function(err) {
            if(err){
              console.log(err);
            }else{
              uploadToQiniu(res,tmpFilePath, "secondHand");
              console.log("success upload");
            }
          });
        })

      })

    }
  })

})



//  编辑已经发布过的商品
router.get('/edit/:id', function(req, res) {
  var vId = req.params.id;
  console.log("*****************logging from /edit/:id--id", vId);
  Valueble.find({_id: vId}, function(err, v) {
    if (err) {
      console.log(err);
    }else {
      console.log("logging from  /edit/:id--valueble", v);
      res.render("secondHandEdit", {
        title: "编辑",
        valueble: v[0]
      })
    }
  })
})

//  更新信息
router.post('/edit',  upload.single('test'), function(req, res) {
  console.log(req.body);
  var vId = req.body['vId'];
  var imageData = JSON.parse(req.body['imageData']);
  var name = req.body['name'];
  var desc = req.body['desc'];
  var price = parseInt(req.body['price']);
  var location = req.body['location'];
  var category = req.body['category'];
  var qq = req.body['qq'];
  var tel = req.body['tel'];
  var authorId = req.session.user._id;
  var time = Date.now();
  User.find({_id: authorId}, "name school avatarUrl", function(err, us) {
    if (err) {
      console.log(err);
    }else {
      var newValueble = {
        author: authorId,
        authorName: us[0].name,
        authorAvatarUrl: us[0].avatarUrl,
        authorSchool: us[0].school,
        name: name,
        desc: desc,
        status: 0,
        location: location,
        category: category,
        qq: qq,
        tel: tel,
        time: time,
        price: price,
        view: 0,
        picUrl: []
      };
      console.log("logging from ******************logging from /valueble/edit --valuebltosave", newValueble);
      Valueble.update({_id: vId}, newValueble, function(err, v) {
        if (err) {
          console.log("save treehole error");
        }
        console.log("*******************logging from /treehole/edit--valueble", v);
        imageData.forEach(function(item, index) {
          var base64Data = item.split(',')[1];
          var fileType = item.split(';')[0].split('/')[1];
          var dataBuffer = new Buffer(base64Data, 'base64');
          var picUrl = "http://obzokcbc0.bkt.clouddn.com/secondHand/" + time + "." + fileType;
          console.log("*****************logging from /secondHand/new--picUrl**************", picUrl);
          Valueble.update({_id: vId}, {$push: {"picUrl": picUrl}}, function(err, raw) {
            if (err) {
              console.log("保存secondHand url出错", err);
            }else {
              console.log(raw);
            }
          });
          var tmpFilePath = "./upload/tmp/" + time + "." + fileType;
          fs.writeFile(tmpFilePath, dataBuffer, function(err) {
            if(err){
              console.log(err);
            }else{
              uploadToQiniu(tmpFilePath, "secondHand");
              res.json({success: true})
              console.log("success upload");
            }
          });
        })

      })

    }
  })
})




// 查看商品详情
router.get('/detail/:id', function(req, res) {
  Valueble.find({_id: req.params.id}, function(err, vs) {
    if (vs.length > 0) {
      console.log("***********************logging from /secondhand/detai/:id--view", vs);
      Valueble.update({_id: req.params.id}, {$set: {view: vs[0].view + 1}}, function(err, row) {
        if (err) {
          console.log(err);
        }else {
          res.render("secondHandDetail", {
            title: "商品详情",
            valueble: vs[0].toObject({getters: true, virtuals: true})
          })
        }
      })
    }else {
      res.render('secondHandDetail', {
        title: "商品详情",
        valueble: null
      })
    }
  })
})
// 个人中心
router.get('/self', function(req, res) {
  if (req.session.user) {
    console.log("*************************log from /secondHand/self--req.session.user**********************", req.session.user);
    var q = Valueble.find({author: req.session.user._id});
    q.sort([['_id', -1]]).exec(function(err, vs) {
      if (err) {
        console.log("取出用户对应的商品出错出错", err);
      }else {
        console.log("*******************logging from /secondHand/self--valuebles***************", vs);
        if (vs) {
          res.render("secondHandSelf", {
            title: "个人中心",
            valuebles: vs.map(function(item, index) {
              return item.toObject({getters: true, virtuals: true});
            }),
            user: req.session.user
          })
        }else {
          res.render("secondHandSelf", {
            title: "个人中心",
            user: req.session.user,
            valuebles: null
          })
        }
      }
    })
  }else {
    res.render("secondHandSelf", {
      title: "个人中心",
      user: null,
      treeholes: null
    })
  }
})



//  改变是商品状态
router.post('/action', function(req, res) {
  console.log("***************************logging from /secondHand/action--req.body*****", req.body);
  var vId = req.body.vId;
  switch (req.body.type) {
    case "del":
      Valueble.remove({_id: vId}, function(err, v) {
        if (err) {
          console.log(err);
        }else {
          res.json({
            success: true
          })
        }
      })
      break;
    case "down":
      console.log("in down");
      Valueble.update({_id: vId}, {$set: {status: 1}}, function(err, row) {
        if (err) {
          console.log(err);
        }else {
          res.json({
            success: true
          })
        }
      })
      break;
    case "up":
      console.log("in up");
      Valueble.update({_id: vId}, {$set: {status: 0}}, function(err, row) {
        if (err) {
          console.log(err);
        }else {
          res.json({
            success: true
          })
        }
      })
      break;
    case "sold":
      Valueble.update({_id: vId}, {$set: {status: 2}}, function(err, row) {
        if (err) {
          console.log(err);
        }else {
          res.json({
            success: true
          })
        }
      })
      break;
    case "edit":
      var imageData = JSON.parse(req.body['imageData']);
      var name = req.body['name'];
      var desc = req.body['desc'];
      var price = parseInt(req.body['price']);
      var location = req.body['location'];
      var category = req.body['category'];
      var qq = req.body['qq'];
      var tel = req.body['tel'];
      var authorId = req.session.user._id;
      var time = Date.now();
      User.find({_id: authorId}, "name school avatarUrl", function(err, us) {
        if (err) {
          console.log(err);
        }else {
          var newValueble = new Valueble({
            author: authorId,
            authorName: us[0].name,
            authorAvatarUrl: us[0].avatarUrl,
            authorSchool: us[0].school,
            name: name,
            desc: desc,
            status: 0,
            location: location,
            category: category,
            qq: qq,
            tel: tel,
            time: time,
            price: price,
            view: 0
          })
          console.log("logging from ******************logging from /valueble/new --valuebltosave", newValueble);
          newValueble.save(function(err, treehole) {
            if (err) {
              console.log("save treehole error");
            }
            console.log("*******************logging from /treehole/new--treehole", treehole);
            imageData.forEach(function(item, index) {
              var base64Data = item.split(',')[1];
              var fileType = item.split(';')[0].split('/')[1];
              var dataBuffer = new Buffer(base64Data, 'base64');
              var picUrl = "http://obzokcbc0.bkt.clouddn.com/secondHand/" + time + "." + fileType;
              console.log("*****************logging from /secondHand/new--picUrl**************", picUrl);
              Valueble.update({time: time}, {$push: {"picUrl": picUrl}}, function(err, raw) {
                if (err) {
                  console.log("保存secondHand url出错", err);
                }else {
                  console.log(raw);
                }
              });
              var tmpFilePath = "./upload/tmp/" + time + "." + fileType;
              fs.writeFile(tmpFilePath, dataBuffer, function(err) {
                if(err){
                  console.log(err);
                }else{
                  uploadToQiniu(tmpFilePath, "secondHand");
                  res.json({success: true})
                  console.log("success upload");
                }
              });
            })

          })

        }
      })

      break;

    default:

  }
})
module.exports = router;
