describe('LearnJS', function () {
    it('can show a problem view', function () {
        learnjs.showView('#problem-1');
        expect($('.view-container .problem-view').length).toEqual(1);
    });

    it('shows the landing page view when there is no hash', function () {
        learnjs.showView('');
        expect($('.view-container .landing-view').length).toEqual(1);
    });

    it('passes the hash view parameter to the view function', function () {
        spyOn(learnjs, 'problemView');
        learnjs.showView('#problem-42');
        expect(learnjs.problemView).toHaveBeenCalledWith('42');
    });

    it('invokes the router when loaded', function () {
        spyOn(learnjs, 'showView');
        learnjs.appOnReady();
        expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
    });

    it('subscribes to the hash change event', function () {
        learnjs.appOnReady();
        spyOn(learnjs, 'showView');
        $(window).trigger('hashchange');
        expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
    });

    describe('problem view', function () {
        var view;
        beforeEach(function() {
            view = learnjs.problemView('1');
        });

        it('has a title that includes the problem number', function () {
            expect(view.find('.title').text()).toEqual('Problem #1');
        });

        describe('answer section', function() {
            it('can check a correct answer by hitting a button', function() {
                view.find('.answer').val('true');
                view.find('.check-btn').click();
                expect(view.find('.result span').text()).toEqual('Correct!');
            });

            it('rejects an incorrect answer', function() {
                view.find('.answer').val('false');
                view.find('.check-btn').click();
                expect(view.find('.result').text()).toEqual('Incorrect!');
            });
        });
    });

    describe('apply object', function () {
        it('can apply a single object field to markup', function () {
            var elem = $('<div><div data-name="test"></div></div>');
            learnjs._applyObject({test: 'Testing'}, elem);
            expect(elem.find('div[data-name]').text()).toEqual('Testing');
        });

        it('can apply all object fields to markup', function () {
            var obj = {desc: 'Description', code: "if true"};
            var elem = $('<div><div data-name="desc"></div><div data-name="code"></div></div>');

            learnjs._applyObject(obj, elem);
            var els = elem.find('div[data-name]');

            expect(els[0].textContent).toEqual(obj.desc);
            expect(els[1].textContent).toEqual(obj.code);
        });
    });
});