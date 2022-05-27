import RolePermission from '../models/rolepermission';
import Permission from '../models/permission';

class Helper {

	constructor() {}

	checkPermission(roleId, permName) {
		// eslint-disable-next-line no-undef
		const promise = new Promise((resolve, reject) => {
			Permission.findOne({
				where: {
					perm_name: permName
				}
			}).then((perm) => {
				RolePermission.findOne({
					where: {
						role_id: roleId,
						perm_id: perm.id
					}
				}).then((rolePermission) => {
					// console.log(rolePermission);
					if (rolePermission) {
						resolve(rolePermission);
					}
					else {
						reject({message: 'Forbidden'});
					}
				}).catch((error) => {
					reject(error);
				});
			}).catch(() => {
				reject({message: 'Forbidden'});
			});
		}
		);

		return promise;

	}

}

module.exports = Helper;