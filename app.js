var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');

var dotenv = require('dotenv');
dotenv.config();

var app = express();

// logger - winston, morgan
require('./config/winston');
require('./config/morgan')(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//route
var indexRouter = require('./routes/index');

app.use('/', indexRouter);

require('./routes/commonapi')(app);
require('./routes/nft')(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});
const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200,
	credentials: true,
}
app.use(cors(corsOptions));


module.exports = app;
