module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		//
		'airbnb-base',
		'plugin:prettier/recommended',
	],
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'no-console': 'off',
	},
};
