
const { createPool,
		format    } = require('mysql2');

const { isPlainObject,
		parseKeyedQuery,
		iterableValueToArray } = require('./tools');

class MySQLClient {
	constructor (options) {
		this._options = options;

		this._pool_singleton = null;
	}

	get _pool () {
		if (!this._pool_singleton) {
			this._pool_singleton = createPool(this._options);
		}

		return this._pool_singleton;
	}

	fork (options = {}) {
		return new MySQLClient({
			...this._options,
			...options,
		});
	}

	get database () {
		return this._options.database;
	}

	/* async */ query (query, values) {
		if (isPlainObject(values)) {
			[ query, values ] = parseKeyedQuery(query, values);
		}

		if (Array.isArray(values)) {
			iterableValueToArray(values);
		}

		return new Promise((resolve, reject) => {
			this._pool.query(
				query,
				values,
				(error, rows) => {
					if (error) {
						reject(error);
					}
					else {
						resolve(rows);
					}
				},
			);
		});
	}

	/* async */ execute (query, values) {
		if (isPlainObject(values)) {
			[ query, values ] = parseKeyedQuery(query, values);
		}

		if (Array.isArray(values)) {
			iterableValueToArray(values);
		}

		// console.log('MYSQL EXECUTE');
		// console.log('query', query);
		// console.log('values', values);
		// console.log('result', format(query, values));

		return new Promise((resolve, reject) => {
			this._pool.execute(
				query,
				values,
				(error, rows) => {
					if (error) {
						reject(error);
					}
					else {
						resolve(rows);
					}
				},
			);
		});
	}

	/* async */ insert ({ table, row, rows }) {
		if (undefined === rows) {
			if (undefined !== row) {
				rows = [ row ];
			}
		}

		if (undefined === table) {
			throw new Error('Argument `table` must be specified.');
		}
		if (undefined === rows || rows.length === 0) {
			throw new Error('Nothing to insert.');
		}

		const fields = [];
		const values = [];

		for (const row of rows) {
			if (0 === fields.length) {
				for (const [ field, value ] of Object.entries(row)) {
					fields.push(field);
					values.push(value);
				}
			}
			else {
				for (const field of fields) {
					values.push(
						row[field],
					);
				}
			}
		}

		const sql_begin = format(
			'INSERT INTO ?? (??)',
			[
				table,
				fields,
			],
		);
		const values_placeholder = new Array(rows.length).fill('(' + new Array(fields.length).fill('?').join(', ') + ')').join(', ');

		return this.execute(
			`${sql_begin} VALUES ${values_placeholder};`,
			values,
		);
	}
}

module.exports = MySQLClient;
