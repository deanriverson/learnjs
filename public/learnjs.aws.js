/**
 * Module depedencies:
 *   AWS object, loaded from vendor.js
 */
(function() {
    "use strict";

    var learnjs = window.learnjs || {};

    learnjs.aws = {};

    function sendDbRequest(req, retry) {
        var promise = new $.Deferred();
        req.on('error', function (error) {
            if (error.code === "CredentialsError") {
                learnjs.identity.then(function (identity) {
                    return identity.refresh().then(function () {
                        return retry();
                    }, function () {
                        promise.reject(resp);
                    });
                });
            } else {
                promise.reject(error);
            }
        });

        req.on('success', function (resp) {
            promise.resolve(resp.data);
        });

        req.send();
        return promise;
    }

    learnjs.aws.refresh = function () {
        var deferred = new $.Deferred();
        AWS.config.credentials.refresh(function (err) {
            err ? deferred.reject(err) :
                deferred.resolve(AWS.config.credentials.identityId);
        });
        return deferred.promise();
    };

    learnjs.aws.fetchAnswer = function (problemId) {
        return learnjs.identity.then(function (identity) {
            var db = new AWS.DynamoDB.DocumentClient();
            var item = {
                TableName: 'learnjs',
                Key: {
                    userId: identity.id,
                    problemId: problemId
                }
            };
            return sendDbRequest(db.get(item), function () {
                return learnjs.fetchAnswer(problemId);
            })
        });
    };

    learnjs.aws.countAnswers = function (problemId) {
        return learnjs.identity.then(function (identity) {
            var db = new AWS.DynamoDB.DocumentClient();
            var params = {
                TableName: 'learnjs',
                Select: 'COUNT',
                FilterExpression: 'problemId = :problemId',
                ExpressionAttributeValues: {':problemId': problemId}
            };
            return sendDbRequest(db.scan(params), function () {
                return learnjs.countAnswers(problemId);
            })
        });
    };

    learnjs.aws.saveAnswer = function (problemId, answer) {
        return learnjs.identity.then(function (identity) {
            var db = new AWS.DynamoDB.DocumentClient();
            var item = {
                TableName: 'learnjs',
                Item: {
                    userId: identity.id,
                    problemId: problemId,
                    answer: answer
                }
            };
            return sendDbRequest(db.put(item), function () {
                return learnjs.saveAnswer(problemId, answer);
            })
        });
    };

    learnjs.googleSignIn = function (googleUser) {
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

        learnjs.aws.refresh().then(function (id) {
            learnjs.identity.resolve({
                id: id,
                email: googleUser.getBasicProfile().getEmail(),
                refresh: refreshGoogle
            });
        });
    };

    function refreshGoogle() {
        return gapi.auth2.getAuthInstance().signIn({
            prompt: 'login'
        }).then(function(userUpdate) {
            var creds = AWS.config.credentials;
            creds.params.Logins['accounts.google.com'] = userUpdate.getAuthResponse().id_token;
            return learnjs.aws.refresh();
        });
    }
})();

/**
 * Expose the google sign in method as a global function since that's what's expected by the
 * callback in the Google markup (span.g-signin2 element in index.html).
 */
window.googleSignIn = learnjs.googleSignIn;