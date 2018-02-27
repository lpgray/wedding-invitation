var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

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