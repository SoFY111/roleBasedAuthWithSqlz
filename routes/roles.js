/* eslint-disable no-unused-vars */
import express from 'express';
import passport from 'passport';

import User from '../models/user';
import Role from '../models/role';
import Permission from '../models/permission';

require('../config/passport')(passport);

import Helper from '../utils/helper';
const helper = new Helper();

const router = express();

// Create a new Role
router.post('/', passport.authenticate('jwt', {
	session: false
}), function (req, res) {
	helper.checkPermission(req.user.role_id, 'role_add').then((_rolePerm) => {
		if (!req.body.role_name || !req.body.role_description) {
			res.status(400).send({
				msg: 'Please pass Role name or description.'
			});
		}
		else {
			Role
				.create({
					role_name: req.body.role_name,
					role_description: req.body.role_description
				})
				.then((role) => res.status(201).send(role))
				.catch((error) => {
					console.log(error);
					res.status(400).send(error);
				});
		}
	}).catch((error) => {
		res.status(403).send(error);
	});
});

// Get List of Roles
router.get('/', passport.authenticate('jwt', {
	session: false
}), function (req, res) {
	helper.checkPermission(req.user.role_id, 'role_get_all').then((rolePerm) => {
		console.log(rolePerm);
		Role
			.findAll({
				include: [
					{
						model: Permission,
						as: 'permissions'
					},
					{
						model: User,
						as: 'users'
					}
				]
			})
			.then((roles) => res.status(200).send(roles))
			.catch((error) => {
				res.status(400).send(error);
			});
	}).catch((error) => {
		res.status(403).send(error);
	});
});

// Get Role by ID
router.get('/:id', passport.authenticate('jwt', {
	session: false
}), function (req, res) {
	helper.checkPermission(req.user.role_id, 'role_get').then((rolePerm) => {

	}).catch((error) => {
		res.status(403).send(error);
	});
	Role
		.findByPk(
			req.params.id, {
				include: {
					model: Permission,
					as: 'permissions'
				}
			}
		)
		.then((roles) => res.status(200).send(roles))
		.catch((error) => {
			res.status(400).send(error);
		});
});

// Update a Role
router.put('/:id', passport.authenticate('jwt', {
	session: false
}), function (req, res) {
	helper.checkPermission(req.user.role_id, 'role_update').then((rolePerm) => {
		if (!req.params.id || !req.body.role_name || !req.body.role_description) {
			res.status(400).send({
				msg: 'Please pass Role ID, name or description.'
			});
		}
		else {
			Role
				.findByPk(req.params.id)
				.then((role) => {
					Role.update({
						role_name: req.body.role_name || role.role_name,
						role_description: req.body.role_description || role.role_description
					}, {
						where: {
							id: req.params.id
						}
					}).then(() => {
						res.status(200).send({
							'message': 'Role updated'
						});
					}).catch(err => res.status(400).send(err));
				})
				.catch((error) => {
					res.status(400).send(error);
				});
		}
	}).catch((error) => {
		res.status(403).send(error);
	});
});

// Delete a Role
router.delete('/:id', passport.authenticate('jwt', {
	session: false
}), function (req, res) {
	helper.checkPermission(req.user.role_id, 'role_delete').then((rolePerm) => {
		if (!req.params.id) {
			res.status(400).send({
				msg: 'Please pass role ID.'
			});
		}
		else {
			Role
				.findByPk(req.params.id)
				.then((role) => {
					if (role) {
						Role.destroy({
							where: {
								id: req.params.id
							}
						}).then(() => {
							res.status(200).send({
								'message': 'Role deleted'
							});
						}).catch(err => res.status(400).send(err));
					}
					else {
						res.status(404).send({
							'message': 'Role not found'
						});
					}
				})
				.catch((error) => {
					res.status(400).send(error);
				});
		}
	}).catch((error) => {
		res.status(403).send(error);
	});
});

// Add Permissions to Role
router.post('/permissions/:id', passport.authenticate('jwt', {
	session: false
}), function (req, res) {
	helper.checkPermission(req.user.role_id, 'role_add').then((rolePerm) => {
		if (!req.body.permissions) {
			res.status(400).send({
				msg: 'Please pass permissions.'
			});
		}
		else {
			Role
				.findByPk(req.params.id)
				.then((role) => {
					req.body.permissions.forEach(function (item, index) {
						Permission
							.findByPk(item)
							.then(async (perm) => {
								await role.addPermissions(perm, {
									through: {
										selfGranted: false
									}
								});
							})
							.catch((error) => {
								res.status(400).send(error);
							});
					});
					res.status(200).send({
						'message': 'Permissions added'
					});
				})
				.catch((error) => {
					res.status(400).send(error);
				});
		}
	}).catch((error) => {
		res.status(403).send(error);
	});
});

module.exports = router;