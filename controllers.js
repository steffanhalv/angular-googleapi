angular.module('demo', ["googleApi"])
    .config(function(googleLoginProvider) {
        googleLoginProvider.configure({
            clientId: '740768586841-dv4c8jpq3l1e59oqipm4plmjkjgbvp5r.apps.googleusercontent.com',
            scopes: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/plus.login"]
        });
    })
    .controller( 'DemoCtrl',
        ['$scope', 'googleLogin', 'googleCalendar', 'googlePlus', 'googleDrive',
        function ($scope, googleLogin, googleCalendar, googlePlus, googleDrive) {

            $scope.login = function () {
                googleLogin.login();
            };

            $scope.$on("googlePlus:loaded", function() {
              googlePlus.getCurrentUser().then(function(user) {
                $scope.currentUser = user;
              });
            });
            $scope.currentUser = googleLogin.currentUser;

            $scope.loadEvents = function() {
                this.calendarItems = googleCalendar.listEvents({calendarId: this.selectedCalendar.id});
            };

            $scope.loadCalendars = function() {
                $scope.calendars = googleCalendar.listCalendars();
            };

            $scope.$on("googleDrive:loaded", function() {
                googleDrive.listFiles().then(function(files) {
                    $scope.files = files.items;
                });
            })

        }]
    );
