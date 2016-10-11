module.exports = {
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "react/jsx-wrap-multilines": "error",
        "react/forbid-prop-types": ["error", { "forbid": ["any"] }],
        "react/jsx-boolean-value": "warn",
        "react/jsx-closing-bracket-location": "off",
        "react/jsx-curly-spacing": "warn",
        "react/jsx-indent-props": "off",
        "react/jsx-key": "warn",
        "react/jsx-max-props-per-line": "off",
        "react/jsx-no-bind": "off",
        "react/jsx-no-literals": "off",
        "react/jsx-pascal-case": "warn",
        "react/jsx-sort-prop-types": "off",
        "react/jsx-sort-props": "off",
        "react/no-multi-comp": "warn",
        "react/no-set-state": "off",
        "react/prefer-es6-class": "warn",
        "react/self-closing-comp": "warn",
        "react/sort-comp": "warn"
    }
};