var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var crypto = require('crypto');

require('dotenv').config();

var wxAccessToken = '';
var wxTicket = ''; // get by accesstoken
var wxAccessTokenLastTimeGot = 0, wxTicketLastTimeGot = 0;
var wxConfig = {
  appId: process.env.WX_APP_ID,
  appSecret: process.env.WX_APP_SECRET,
};
var wxPublicConfig = {
  appId: wxConfig.appId,
  noncestr: 'zylpgray',
  timestamp: 0,
  signature: ''
};
function requestWxTicket(callback) {
  if (wxTicket && (Date.now() - wxTicketLastTimeGot) <= 7200000) {
    callback(wxTicket);
    return;
  }
  request(
    'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wxConfig.appId + '&secret=' + wxConfig.appSecret,
    function(err, res, body) {
      if (!err) {
        var data = JSON.parse(body);
        if (data.errcode) {
          callback();
        } else {
          wxAccessToken = data.access_token;
          wxAccessTokenLastTimeGot = Date.now();
          console.log('wxAccessToken', wxAccessToken);
          request(
            'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ wxAccessToken +'&type=jsapi',
            function(err, res, body) {
              if (!err) {
                var data = JSON.parse(body);
                if (data.errcode) {
                  callback();
                } else {
                  wxTicket = data.ticket;
                  wxTicketLastTimeGot = Date.now();
                  console.log('wxTicket', wxTicket);
                  callback(wxTicket);
                }
              } else {
                callback();
              }
            }
          )
        }
      }
    }
  );
}
function getWxPublicConfig(url, callback) {
  requestWxTicket(function() {
    if (wxTicket && wxTicketLastTimeGot) {
      wxPublicConfig.timestamp = wxTicketLastTimeGot;

      var noncestr = wxPublicConfig.noncestr;
      var jsapi_ticket = wxTicket;
      var timestamp = wxTicketLastTimeGot;

      var str = 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url;
      var sha1 = crypto.createHash('sha1');
      sha1.update(str);
      var signature = sha1.digest('hex');
      wxPublicConfig.signature = signature.toString();
      console.log('str', str, ' / signature', wxPublicConfig.signature);
      wxPublicConfig.timestamp = timestamp;
      callback(wxPublicConfig);
    } else {
      callback({});
    }
  });
}

var fileName = process.env.NODE_ENV === 'production' ? 'wishes_production' : 'wishes';
var wishesData = [];
var PORT = process.env.PORT || 8081;

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
app.post('/wxconfig', function(req, res) {
  getWxPublicConfig(req.body.url, function(config) {
    res.json({
      success: true,
      data: config
    });
  });
});
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
app.get('/red-pack', function(req, res) {

});
app.post('/red-pack', function(req, res) {

});
app.listen(PORT);
console.log('server listen on ' + PORT);