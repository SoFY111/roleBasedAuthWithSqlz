const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//load user modal
const User = require('../models/').User;

module.exports = (passport) => {
	const opts = {
		jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
		secretOrKey: 'nodeauthsecret'
	};

	passport.use('jwt', new JwtStrategy(opts, (jwt_payload, done) => {
		try {
			const user = User.findByPk(jwt_payload.id);
			return done(null, user);
		}
		catch (err){
			return done(err, null);
		}
	}));
};
