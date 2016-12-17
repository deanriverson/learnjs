/**
 * Module depedencies:
 *   AWS object, loaded from vendor.js
 */
(function() {
    "use strict";

    var learnjs = window.learnjs || {};

    learnjs.aws = {};

    learnjs.aws.refresh = function () {
        var deferred = new $.Deferred();
        AWS.config.credentials.refresh(function (err) {
            err ? deferred.reject(err) :
                deferred.resolve(AWS.config.credentials.identityId);
        });
        return deferred.promise();
    };

    learnjs.googleSignIn = function(googleUser) {
        var id_token = googleUser.getAuthResponse().id_token;

        AWS.config.update({
            region: 'us-east-1',
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: learnjs.poolId,
                Logins: {
                    'accounts.google.com': id_token
                }
            })
        });

        learnjs.aws.refresh().then(function(id) {
            learnjs.identity.resolve({
                id: id,
                email: googleUser.getBasicProfile().getEmail(),
                refresh: refresh
            });
        });
    };

    function refresh() {
        return gapi.auth2.getAuthInstance().signIn({
            prompt: 'login'
        }).then(function(userUpdate) {
            var creds = AWS.config.credentials;
            creds.params.Logins['accounts.google.com'] = userUpdate.getAuthResponse().id_token;
            return learnjs.aws.refresh();
        });
    }
})();
