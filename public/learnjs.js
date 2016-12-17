"use strict";

var learnjs = window.learnjs || {};

learnjs.poolId = "us-east-1:7c03292f-8fa8-4737-aaee-0eb05f5da093";
learnjs.identity = new $.Deferred();
learnjs.problems = [
    {
        description: "What is truth?",
        code: "function problem() { return __; }"
    },
    {
        description: "Simple Math",
        code: "function problem() { return 42 === 6 * __; }"
    }
];

learnjs.appOnReady = function () {
    window.onhashchange = function () {
        learnjs.showView(window.location.hash);
    };
    learnjs.showView(window.location.hash);
    learnjs.identity.done(learnjs.addProfileLink);
};

learnjs.addProfileLink = function (profile) {
    var link = learnjs.template('profile-link');
    link.find('a').text(profile.email);
    $('.signin-bar').prepend(link);
    $('.g-signin2').remove();
};

learnjs.template = function (name) {
    return $('.templates .' + name).clone();
};

learnjs.triggerEvent = function (name, args) {
    $('.view-container > *').trigger(name, args);
};

learnjs.showView = function (hash) {
    var routes = {
        '': learnjs.landingView,
        '#': learnjs.landingView,
        '#problem': learnjs.problemView,
        '#profile': learnjs.profileView
    };

    var path = hash.split('-');
    var viewFn = routes[path[0]];
    var viewParams = path.slice(1);

    if (viewFn) {
        learnjs.triggerEvent('removingView', []);
        $('.view-container').empty().append(viewFn.apply(learnjs, viewParams));
    }
};
