(function () {
    'use strict';

    angular
        .module('tgiCognitiveHackApp')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register ($resource) {
        return $resource('api/register', {}, {});
    }
})();
