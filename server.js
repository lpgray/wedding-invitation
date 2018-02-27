var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');

var wxAccessToken = '';
var wxAccessTokenTimer, wxAccessTokenLastTimeGot = 0;
var wxConfig = {
  appId: 'wxa371f2237d652ce1',
  appSecret: 'c57057a76d90e764bf5f88269022328c'
};
function requestWxAccessToken(callback) {
  if (wxAccessToken && Date.now() - wxAccessTokenLastTimeGot <= 7200000) {
    callback(wxAccessToken);
    return;
  }
  request(
    'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wxConfig.appId + '&secret=' + wxConfig.appSecret,
    function(err, res, body) {
      if (!err) {
        var data = JSON.parse(body);
        if (data.errcode) {
          callback('');
        } else {
          wxAccessToken = data.access_token;
          wxAccessTokenLastTimeGot = Date.now();
          callback(wxAccessToken);
        }
      }
    }
  );
}


var fileName = process.env.NODE_ENV === 'production' ? 'wishes_production' : 'wishes';
var wishesData = [];
var PORT = process.env.PORT || 8080;

if (fs.existsSync('./' + fileName)) {
  var str = fs.readFileSync('./' + fileName);
  if (str) {
    wishesData = JSON.parse(str);
  }
}

function writeWishesData() {
  if (wishesData) {
    fs.writeFileSync('./' + fileName, JSON.stringify(wishesData));
  }
}

var writeFileTimes = 1; // 循环这个数字，不断写入 wishes 数据至文本文件

function checkWriteFileFunc() {
  if (writeFileTimes > 0) {
    writeFileTimes -= 1;
    writeWishesData();
  }
  setTimeout(checkWriteFileFunc, 1000);
}

checkWriteFileFunc();

function reverse(arr) {
  return JSON.parse(JSON.stringify(arr)).reverse();
}

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));  // parse application/x-www-form-urlencoded
app.use(bodyParser.json());  // parse application/json
app.use(express.static('./public'));
app.get('/wishes', function(req, res) {
  res.json({
    success: true,
    data: reverse(wishesData)
  });
});
app.post('/wishes', function(req, res) {
  var payload = req.body;
  wishesData.push({
    name: payload.name,
    text: payload.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  });
  writeFileTimes += 1;
  res.json({
    success: true,
    data: reverse(wishesData)
  });
});
app.listen(PORT);