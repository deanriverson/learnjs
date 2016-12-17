/**
 * Module dependencies:
 *   learnjs module funcs, loaded from learnjs.js
 */
(function () {
    "use strict";

    var learnjs = window.learnjs || {};

    function buildCorrectFlash(problemNumber) {
        var correctFlash = learnjs.template('correct-flash');
        var link = correctFlash.find('a');
        if (problemNumber < learnjs.problems.length) {
            link.attr('href', '#problem-' + (problemNumber + 1));
        } else {
            link.attr('href', '');
            link.text("You're Finished!");
        }
        return correctFlash;
    }

    function flashElement(elem, content) {
        elem.fadeOut('fast', function () {
            elem.html(content);
            elem.fadeIn();
        });
    }

    function applyObject(obj, elem) {
        for (var key in obj) {
            elem.find('[data-name="' + key + '"]').text(obj[key]);
        }
    }

    learnjs.problemView = function (data) {
        var problemNumber = parseInt(data, 10);
        var view = learnjs.template('problem-view');

        var problemData = learnjs.problems[problemNumber - 1];
        var resultFlash = view.find('.result');

        function checkAnswer() {
            var answer = view.find('.answer').val();
            var test = problemData.code.replace('__', answer) + '; problem();';
            return eval(test);
        }

        function checkAnswerClick() {
            if (checkAnswer()) {
                var correctFlash = buildCorrectFlash(problemNumber);
                flashElement(resultFlash, correctFlash);
            } else {
                flashElement(resultFlash, 'Incorrect!');
            }
            return false;
        }

        if (problemNumber < learnjs.problems.length) {
            var buttonItem = learnjs.template('skip-btn');
            buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));
            $('.nav-list').append(buttonItem);
            view.bind('removingView', function () {
                buttonItem.remove();
            });
        }

        view.find('.check-btn').click(checkAnswerClick);
        view.find('.title').text('Problem #' + problemNumber);
        applyObject(problemData, view);
        return view;
    };

    learnjs.landingView = function () {
        return learnjs.template('landing-view');
    };

    learnjs.profileView = function () {
        var view = learnjs.template('profile-view');
        learnjs.identity.done(function (identity) {
            view.find('.email').text(identity.email);
        });
        return view;
    };

    /**
     * Export these for testing purposes
     */
    learnjs._applyObject = applyObject;
})();
