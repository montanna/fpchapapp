var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 4000));

app.use(express.static(__dirname));

// views is directory for all template files
app.set('views', "./views");
app.set('view engine', 'pug');

app.get('/', function(request, response) {
    response.render('index');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
