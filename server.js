/************************************************************************
* TRANSLOADIT EXAMPLE APPLICATIOM
*
*  Demonstrates the use of Transloadit for handling image uploads and
*  manipulation.
*
************************************************************************/

/************************************************************************
* REQUIRE MODULES
************************************************************************/
var express     			=   require('express')
	, config						=		require('config')
	, bodyParser        =   require('body-parser')
  , exphbs      			=   require('express-handlebars')
  , mongoose    			=   require('mongoose')
  , session           =   require('express-session')
  , passport 					= 	require('passport')
  , LocalStrategy 		= 	require('passport-local').Strategy
  , mongodb 					= 	require('mongodb')
  , mongoose 					= 	require('mongoose')
  , TransloaditClient =   require('transloadit')
  , transloadit       =   new TransloaditClient({
      authKey     : config.transloadit.auth_key,
      authSecret  : config.transloadit.auth_secret
    })
  , bcrypt 						= 	require('bcrypt')
  , SALT_WORK_FACTOR 	= 	10;

/************************************************************************
* DATABASE CONNECTION
************************************************************************/
mongoose.connect(config.mongo.host, config.mongo.name);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

/************************************************************************
* SCHEMA
************************************************************************/
var userSchema = mongoose.Schema({
  username 		: { type: String, required: true, unique: true },
  email 			: { type: String, required: true, unique: true },
  password 		: { type: String, required: true },
  avatar 			: { type: mongoose.Schema.Types.Mixed, required: false }
});

/************************************************************************
* PASSWORD MIDDLEWARE
************************************************************************/
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) {
    return next();
  }

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

/************************************************************************
* PASSWORD VERIFICATION
************************************************************************/
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

/************************************************************************
* SEED THE DATABASE
************************************************************************/
var User = mongoose.model('User', userSchema)
  , user = new User({ username: 'bob', email: 'bob@example.com', password: 'secret' });

user.save(function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('user: ' + user.username + " saved.");
  }
});

/************************************************************************
* PASSPORT SESSION HANDLING
************************************************************************/
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

/************************************************************************
* PASSPORT STRATEGY SETUP
************************************************************************/
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

/************************************************************************
* AUTHENTICATION MIDDLEWARE
************************************************************************/
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

/************************************************************************
* SET UP THE EXPRESS APPLICATION
************************************************************************/
var app = express();

// Make the bower_components and public directory available as static file directories
app.use(express.static(__dirname + '/bower_components'))
app.use(express.static(__dirname + '/public'))

// Configure the body parser for form data
app.use(bodyParser.urlencoded({ extended: true }))

// Set up templating using Handlebars
app.engine('.hbs', exphbs(
	{
		extname: '.hbs',
		defaultLayout: 'default',
		helpers : {
			json : function(context) {
				return JSON.stringify(context);
			}
		}

	}
));
app.set('view engine', '.hbs');

// Configure sessions
app.use(session({
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false
}))

// Set up Passport with Express
app.use(passport.initialize());
app.use(passport.session());

/************************************************************************
* DEFINE THE ROUTES
************************************************************************/

// Homepage
app.get('/', function(req, res){

  return res.render('index', { user: req.user });

});

// The account page
app.get('/account', ensureAuthenticated, function(req, res){

	// Build the Transloadit parameters...
	var params = {
		template_id 	: 	config.transloadit.template_id
	};

	// ...and generate the signature
	var sig = transloadit.calcSignature(params);  

  res.render('account', {
  	user: req.user,
  	sig : sig
  });

});

// AJAX callback for setting the avatar
app.post('/avatar', ensureAuthenticated, function(req, res){
	req.user.avatar = req.body
	req.user.save(function(err) {
	  if(err) {
	    return res.send('error');
	  }
    return res.send('ok');
	});
});

// Render the login page
app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.session.messages });
});

// POST callback for the login page
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/account');
    });
  })(req, res, next);
});

// Logout route
app.get('/logout', function(req, res){
  req.logout();
  return res.redirect('/');
});

/************************************************************************
* START LISTENING
************************************************************************/
app.listen(config.app.port, function() {
  console.log('Express server listening on port ' + config.app.port);
});
