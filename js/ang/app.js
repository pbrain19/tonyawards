'use strict';


// Declare app level module which depends on filters, and services



var app = angular.module('myApp', [
    'webcam',
    'infinite-scroll'

]);




app.directive('masonry', function() {
    return {
        restrict: 'AC',
        controller: function($scope) {
            return $scope.$watch(function(e) {
                $scope.masonry.reloadItems();
                return $scope.masonry.layout();
            });
        },
        link: function(scope, elem, attrs) {
            var container = elem[0];
            var options = '';
            return scope.masonry = new Masonry(container, options);
        }
    };

});
app.controller('main', function($scope, $http, $sce, $rootScope) {


    var getvideos = "https://www.googleapis.com/youtube/v3/playlistItems?key=AIzaSyB77uGOBIw-r8GxEh4r8gImPsAUxIWt9zk&playlistId=PL6zkQ5E3hUvpI9_tSXiMisxE-LEIBC8ON&part=snippet,id&order=date&maxResults=20";
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };
    $scope.changeVideo = function(vid) {
        $scope.currentvideo = vid;
    };
    $scope.divPivot = '';
    $scope.takeselfie = function() {
        $rootScope.divPivot = 'photoBooth';
        $rootScope.screenSelector = true;
    }
    $scope.return2video = function() {
        $rootScope.divPivot = '';
        $rootScope.screenSelector = false;
    }
    $http.get(getvideos)
            .success(function(data) {

                console.log(data)
                $scope.videos = data.items;
                $scope.currentvideo = data.items[0];
            });


});
app.controller('photoCtrl', function($scope, $timeout, $http, $rootScope) {
    $scope.Emailuser = {};
    var tl;
    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
        return pattern.test(emailAddress);
    }
    ;


    $(document).idle({
        onIdle: function() {
            var piccan = $('#snapshot')[0];
            piccan.width = 0;
            piccan.height = 0;
            $scope.$apply(function() {
                $scope.shareActive = false;
                $scope.pictureTaken = false;
                $rootScope.divPivot = '';
                $rootScope.screenSelector = false;
            });
        },
        idle: 60000
    });

    var m = new mandrill.Mandrill('C7LDjR0CdMlYzu12b4zGEg');

    window.fbAsyncInit = function() {
        FB.init({
            appId: '310262122459461',
            status: true,
            cookie: true,
            xfbml: true  // parse XFBML
        });
    };

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
    }
    (document, 'script', 'facebook-jssdk'));

    var _video;
    // var canvas;
    var base_image = new Image();
    base_image.src = 'img/window.png';
    $scope.onSuccess = function(videoElem) {
        // The video element contains the captured camera data
        _video = videoElem;
    };



    var authToken = "CAACEdEose0cBAI7UjTWP5croYRKZBjY5iBD1spKW2QwDXdAHilN5mRZA4JxPdaWLcIZCavCJnZCUmdOvxX37PneBE85b2qFbYqIZAIUwyycVQTMsiY3BBnQ74Qn6dq3xmJTNyvWrQFeoHPnPGdvvanWTegJY8ZBj1TwyChi7ggL99HF0lMV4wp14RWKJEZAD1LvUsG49i1RuwZDZD";
    function postFoto(image) {
        console.log('uploading to facebook');
        FB.api(
                "/616162948465854/photos", //616162948465854
                "POST",
                {
                    "name": "#serinocoyne",
                    "url": image,
                    "message": "#serinocoyne",
                    "access_token": authToken
                },
        function(response) {
            if (response && !response.error) {
                console.log(response);
            }
        }
        );
    }
    function sendEmail(linkToImage) {

        var userEmail = $scope.Emailuser.email;
        var ableToShare = $('#shareToSerino').prop('checked');
        console.log(userEmail);
        var params = {
            "message": {
                "from_email": "test@serinocoyne.com",
                "to": [{"email": userEmail}],
                "subject": "S/C Selfie",
                "html": "<p>Share your photo via your social networks! </p>"
            }
        };

        params.message.html = params.message.html + '<img src=" ' + linkToImage + ' ">';
        params.message.autotext = true;
        if (ableToShare) {
            params.message.to.push({"email": 'pbrain19@gmail.com'});
        }

        m.messages.send(params, function(res) {
            console.log(res);
            $('#camera-retake').click();

            $scope.mailSent = true;


            setTimeout(function() {

                var piccan = $('#snapshot')[0];
                piccan.width = 0;
                piccan.height = 0;

                $scope.$apply(function() {

                    $scope.hasBeenShared = false;
                    $scope.shareActive = false;
                    $scope.pictureTaken = false;
                    $rootScope.divPivot = '';
                    $rootScope.screenSelector = false;
                });
            }, 5000);

        }, function(err) {
            console.log(err);
            $scope.mailSent = true;
        });
    }
    $scope.snapshot = function() {

        var piccan = $('#snapshot')[0];
        var videosize = $('.booth video');
        piccan.width = videosize.width();
        piccan.height = videosize.height();
        var context = piccan.getContext('2d');
        context.drawImage(_video, 44, 38, videosize.width() / 1.08, videosize.height() / 1.10);
        context.drawImage(base_image, 0, 0, videosize.width(), videosize.height() + 2);

    };
    $scope.backToVideos = function() {
        $scope.hasBeenShared = false;
        var piccan = $('#snapshot')[0];
        piccan.width = 0;
        piccan.height = 0;
        $scope.shareActive = false;
        $scope.pictureTaken = false;
        $rootScope.divPivot = '';
        $rootScope.screenSelector = false;
    }
    $scope.shareThis = function() {
        if (!isValidEmailAddress($('#useremail').val())) {
            alert('invalid email');
        } else {
            tl = new TimelineLite();
            tl.to($('#share'), 1, {left: '-8%', opacity: 0});
            $('#shareConfirmed>img').attr({src: "img/loading.gif"});

            $scope.hasBeenShared = true;


            var canvas = document.getElementById("snapshot");
            var data = canvas.toDataURL("image/png");
            var imageUrl;

            $http.post('http://metroclick.us:8080/metroselfies/SelfieS3', {dataurl: data}).success(function(data) {
                console.log(data);

                $('#shareConfirmed>img').attr({src: "img/confirm.png"});
                tl.to($('#share'), 1, {left: '8.5%', opacity: 1});


                $('#share input').val('');
                sendEmail(data);
            }).error(function(err) {
                console.log(err);
            });
        }
    };


    $scope.takePhoto = function() {
        $('#camera-take').attr({src: "img/CD/countdown.gif"});
        setTimeout(function() {
            $('#camera-take').attr({src: "img/PB/tp_PB.png"});
            $scope.snapshot();
            $scope.$apply(function() {
                $scope.pictureTaken = true;
            })
        }, 2500);


    };
    $scope.enableShare = function() {
        $scope.shareActive = true;
        $('#share input').val('');
        $('#shareToSerino').prop('checked', true);
    };

    $scope.retake = function() {

        var piccan = $('#snapshot')[0];
        piccan.width = 0;
        piccan.height = 0;

        $scope.hasBeenShared = false;
        $scope.shareActive = false;
        $scope.pictureTaken = false;


    };

}).controller('social', function($scope, $http, $interval) {

    $scope.posts = [];
    var fbfeeds = [];
    var twitterfeeds = [];
    var facebook = 'http://metroclick.us:8080/facebookfeeds/?screenName=TheTonyAwards';
    var twitter = 'http://metroclick.us:8080/twitterfeeds/?screenName=TheTonyAwards';
    var instagram = 'http://metroclick.us:8080/instagramfeeds/?screenName=TheTonyAwards';

    var getFeeds = function() {

        $http.get(facebook).success(function(data) {
            console.log(data);
            angular.forEach(data, function(value) {
                this.push(value);
            }, $scope.posts);
        }).error(function(err) {
            console.log(err);
        });

        $http.get(twitter).success(function(data) {
            console.log(data);
            angular.forEach(data, function(value) {
                this.push(value);
            }, $scope.posts);
        }).error(function(err) {
            console.log(err);
        });

        $http.get(instagram).success(function(data) {
            console.log(data);
            angular.forEach(data, function(value) {
                this.push(value);
            }, $scope.posts);
        }).error(function(err) {
            console.log(err);
        });

    }

    getFeeds();
    $interval(function() {
        getFeeds()
    }, 120000)

    $scope.user = {provider: 'facebook'};



}).controller('videos', function($scope) {

    setTimeout(function() {

        $('#videoSelector').owlCarousel({autoPlay: 2000, items: 4});
    }, 3000);

})
