var express = require('express');         //copiado de https://gist.github.com/gabmontes/e496a41f835bca65e99b

var app = express();

app.use(express.static('www'));

var server = app.listen(80, function () {
  console.log('Servidor web iniciado');
});
