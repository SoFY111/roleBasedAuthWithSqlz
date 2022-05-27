'use strict';
const {
	Model
} = require('sequelize');

import bcrypt from 'bcryptjs';

module.exports = (sequelize, DataTypes) => {
	class User extends Model {

		static associate(models) {
			User.hasOne(models.Role, {
				foreignKey: 'user_id',
				as: 'role'
			});
		}

	}
	User.init({
		role_id: DataTypes.INTEGER,
		email: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		fullname: {
			type: DataTypes.STRING,
			allowNull: false
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'User'
	});

	User.beforeSave(async (user) => {
		if (User.password){
			User.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
		}
	});

	User.prototype.comparePassword = (passw, cb) => {
		bcrypt.compare(passw, this.password, (err, isMatch) => {
			if (err) return cb(err);
			cb(null, isMatch);
		});
	};

	return User;
};