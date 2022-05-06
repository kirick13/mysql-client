
exports.isPlainObject = (object) => object && typeof object === 'object' && object.constructor === Object;
const isIterable = exports.isIterable = (value) => value && typeof value === 'object' && Symbol.iterator in value;

const keyedQueryRegex = /:(:?)(\w+)/g;
exports.parseKeyedQuery = (query, values) => {
	const values_arr = values ? [] : null;

	const query_new = query.replace(
		keyedQueryRegex,
		(_, type_mark, key) => {
			if (values) {
				const value = values[key];
				if (undefined === value) {
					throw new Error(`Value for key ${key} is undefined.`);
				}

				values_arr.push(value);
			}

			return (1 === type_mark.length) ? '??' : '?';
		},
	);

	return [
		query_new,
		values_arr,
	];
};

exports.iterableValueToArray = (values) => {
	for (const [ index, value ] of values.entries()) {
		if (
			isIterable(value)
			&& Array.isArray(value) !== true
		) {
			values[index] = Array.from(value);
		}
	}

	return values;
};
