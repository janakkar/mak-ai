const _ = require('ramda');
const readline = require('readline');
const Task = require('data.task');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const test = [{
    "ask": "Anything I need to know about?",
    "yes": {
        "ask": "What is it?"
    }
}, {
    "ask": "Anything else?"
},
{
    "ask": "You sure?",
    "id": 1003
}];

const askQuestion = (question) => new Task((rej, res) =>
    rl.question(question, (answer) => res({ question, answer })));

const logAnswer = ({ question, answer }) => {
    console.log(`Your answer for question: ${question}, is: ${answer}`);
};

const logAnswerAskNextQuestion = (answered, question) => {
    console.log('----@'); logAnswer(answered);
    return askQuestion(question);
};

const askAllQuestions = _.reduce((t, q) => {
    return t ? t.chain(answered => logAnswerAskNextQuestion(answered, q)) : askQuestion(q);
}, undefined);

const getAllQuestions = _.map(_.prop('ask'));

const mak = (listOfQuestions) => askAllQuestions(getAllQuestions(listOfQuestions));

mak(test).fork(console.error, logAnswer);




