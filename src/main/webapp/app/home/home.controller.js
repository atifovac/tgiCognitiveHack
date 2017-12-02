(function () {
    'use strict';

    angular
        .module('tgiCognitiveHackApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http', 'recorderService'];

    function HomeController($scope, Principal, LoginService, $state, $http, recorderService) {
        var vm = this;

        vm.patOpts = {x: 0, y: 0, w: 25, h: 25};
        vm.data = {
            address: '',
            name: ''
        };
        vm.takeSnapshot = false;
        vm.docNeeded = false;
        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.text = "";
        vm.register = register;
        $scope.$on('authenticationSuccess', function () {
            getAccount();
        });

        vm.getService = function () {
            return recorderService.controller('audioInput');
        };

        vm.$onInit = function () {
            vm.myChannel = {
                // the fields below are all optional
                videoHeight: 800,
                videoWidth: 600,
                video: null // Will reference the video element on success
            };
            console.log(vm.service);
        };

        getAccount();

        function getAccount() {
            Principal.identity().then(function (account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }

        function register() {
            $state.go('register');
        }

        vm.analyzeRecord = function () {
            var pippo = new FormData();
            pippo.append('file', vm.getService().audioModel);
            console.log(pippo);
            $http.post('https://tgi.eu-de.mybluemix.net/send_voice', pippo, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function (resp) {
                vm.text = resp.data.payload;
                vm.features = resp.data.features;
                if (resp.data.person) {
                    vm.data.name = resp.data.person;
                }
                if (resp.data.location) {
                    vm.data.location = resp.data.location;
                }
                if (resp.data.document) {
                    vm.data.document = resp.data.document;
                    vm.takeSnapshot = true;
                    vm.docNeeded = true;
                }
                if (resp.data.mortgage) {
                    vm.data.mortgage = resp.data.mortgage;
                }
            }, function (error) {
                console.log(error);
                return error;
            });
        };

        vm.doAction = function () {
            let service = vm.getService();
            if (!service.status.isRecording) {
                console.log('is not recording');
                service.startRecord();
            } else {
                console.log('is recording');
                service.stopRecord();
                setTimeout(function () {
                    vm.analyzeRecord();
                }, 1000);
            }
        };

        vm.onStream = function (stream) {
            console.log(stream);
        };

        vm.onSuccess = function () {
            var _video = vm.myChannel.video;
            $scope.$apply(function() {
                vm.patOpts.w = _video.width;
                vm.patOpts.h = _video.height;
            });
        };

        vm.onError = function (err) {};

        var getVideoData = function getVideoData(x, y, w, h) {
            var _video = vm.myChannel.video;
            var hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = _video.width;
            hiddenCanvas.height = _video.height;
            var ctx = hiddenCanvas.getContext('2d');
            ctx.drawImage(_video, 0, 0, _video.width, _video.height);
            return ctx.getImageData(x, y, w, h);
        };

        vm.makeSnapshot = function makeSnapshot() {
            var _video = vm.myChannel.video;
            if (_video) {
                var patCanvas = document.querySelector('#snapshot');
                if (!patCanvas) return;

                patCanvas.width = _video.width;
                patCanvas.height = _video.height;
                var ctxPat = patCanvas.getContext('2d');

                var idata = getVideoData(vm.patOpts.x, vm.patOpts.y, vm.patOpts.w, vm.patOpts.h);
                ctxPat.putImageData(idata, 0, 0);

                //sendSnapshotToServer(patCanvas.toDataURL());
                vm.takeSnapshot = false;
            }
        };

        vm.saveSnapshot = function () {
            vm.data.documentUrl = document.querySelector('#snapshot').toDataURL();
            vm.docNeeded = false;
            vm.takeSnapshot = false;ù
            //window.open(vm.data.documentUrl, '_blank');
        };

        vm.redoSnapshot = function () {
            vm.takeSnapshot = true;
        };


    }
})();
