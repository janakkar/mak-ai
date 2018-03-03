const assert = require('chai').assert;
const _ = require('ramda');
const mockery = require('mockery'), should = require('chai').should();


const getQuestions = _.map(_.compose(_.prop('ask'), _.prop('question')));
const getAnswers = _.map(_.prop('answer'));

const transformAnswers = (context) =>
    _.zipObj(getQuestions(context.answers), getAnswers(context.answers));

const testLastAnswerAndLength = (context, lastAnswer, numberOfAnswered) => {
    assert.equal(lastAnswer, context.answer);
    assert.equal(numberOfAnswered, context.answers.length);
};

const testAnswers = (context, expected) =>
    assert.deepEqual(expected, transformAnswers(context));

describe('ask question - collect answers', () => {

    let makApp, rl;
    const test_3_levels = [{
        "ask": "q1",
        "a1": [{
            "ask": "q11",
            "a11": [{
                "ask": "q111"
            }]
        }]
    }];

    before(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        // mock of node's readline
        let answers;
        rl = {
            setAnswers: function (a) {
                answers = a;
            }, question: function (q, callback) {
                const answer = answers[q];
                return callback(answer);
            }
        };

        mockery.registerMock('readline', { createInterface: () => rl });

        // required after we have node's readline mock ready
        const { mak } = require('./mak');
        makApp = mak;
    });

    it('Test simple list of questions', function () {
        const test = [{ "ask": "q1" }, { "ask": "q2" }, { "ask": "q3" }];
        const prepared = { q1: 'a1', q2: 'a2', q3: 'a3' };
        rl.setAnswers(prepared);

        makApp(test).fork(console.error, (context) => {
            testLastAnswerAndLength(context, 'a3', 3);
            testAnswers(context, prepared);
        });
    });
    it('Test follow up question second level', function () {
        const prepared = { q1: 'a1', q11: 'yes', q111: 'not asked' };
        const expected = { q1: 'a1', q11: 'yes' };
        rl.setAnswers(prepared);

        makApp(test_3_levels).fork(console.error, (context) => {
            testLastAnswerAndLength(context, 'yes', 2);
            testAnswers(context, expected);
        });
    });

    it('Test deeper follow up question', function () {
        const prepared = { q1: 'a1', q11: 'a11', q111: 'a111' };
        rl.setAnswers(prepared);

        makApp(test_3_levels).fork(console.error, (context) => {
            testLastAnswerAndLength(context, 'a111', 3);
            testAnswers(context, prepared);
        });
    });

});  