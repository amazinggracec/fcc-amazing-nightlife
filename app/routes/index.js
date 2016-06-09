var path = process.cwd();
var Yelp = require('yelp');
var Businesses = require('../models/businesses.js');
var Users = require('../models/users.js');

module.exports = function(app, passport){
	
	var yelp = new Yelp({
		consumer_key: process.env.YELP_CONSUMER_KEY,
		consumer_secret: process.env.YELP_CONSUMER_SECRET,
		token: process.env.YELP_TOKEN,
		token_secret: process.env.YELP_TOKEN_SECRET,
    });

	app.route('/login')
		.get(function(req, res){
			res.redirect('/auth/twitter');
		});
	
	app.get('/auth/twitter',
		passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', 
		passport.authenticate('twitter', { failureRedirect: '/login' }),
		function(req, res) {
		// Successful authentication, redirect home.
		updateLocation(req);
		res.redirect('/');
	});
	
	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});
		
	app.get('/', function(req, res){
		res.sendFile(path + '/public/index.html');
	});
	
	function updateLocation(req){
		if (req.isAuthenticated()){
			Users.findOne({id: req.user.id}, function(err, doc){
				if (err){
					throw err;
				}
				doc.curr_location = req.session.curr_location;
				doc.save();
			});
		}		
	}
	
	app.get('/authentication', function(req, res){
		if (req.isAuthenticated()){
			Users.findOne({id: req.user.id}, function(err, doc){
				if (err){
					throw err;
				}
				res.jsonp({
					"authenticated": true,
					"curr_location": doc.curr_location
				});
			});
		}
	});
	
	app.get('/location/:result', function(req, res){
		req.session.curr_location = req.params.result;
		updateLocation(req);
		
		yelp.search({ term: 'bars', location: req.session.curr_location, limit: 20})
	        .then(function (data) {
	        	res.jsonp(data.businesses);
	    })
	    	.catch(function (err) {
	        	res.send(err);
	    });
		
	});
	
	function check_going(business_id, res){
		Businesses.find({"id": business_id}, function(err, business){
			res.json({"status": true, "num_going": business == null? 0: business.length});
		});		
	}
	
	app.get('/business/:id/init', function(req, res){
		check_going(req.params.id, res);
	});
	
	app.get('/business/:id/toggle', function(req, res){
		
		if (req.isAuthenticated()) {
			Businesses.findOne({"id": req.params.id, "twitter_id": req.user.twitter.id}, function(err, business){
				if (err){
					throw err;
				}
				else{
					if (business == null){
						var newBusiness = new Businesses();
						newBusiness.id = req.params.id;
						newBusiness.twitter_id = req.user.twitter.id;
						newBusiness.save(function(err){
							if (err){
								throw err;
							}
							check_going(req.params.id, res);
						});
					}
					else{
						Businesses.find({id: req.params.id, twitter_id: req.user.twitter.id}).remove(function(err){
							if (err){
								throw err;
							}
							check_going(req.params.id, res);
						});
					}
				}
			});
			
		} else {
			res.json({"status": false});
		}
	});
};