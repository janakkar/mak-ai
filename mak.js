const _ = require('ramda');
const readline = require('readline');
const Task = require('data.task');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const test = [{
    "ask": "Anything I need to know about?",
    "id": 1001
}, {
    "ask": "Anything else?",
    "id": 1002
},
{
    "ask": "You sure?",
    "id": 1003
}];

const askQuestion = (question) => new Task((rej, res) => rl.question(question, res));
const logAnswer = (answer) => {
    console.log(`Your answer is ${answer}`);
};

const logAnswerAskNextQuestion = (answer, question) => {
    logAnswer(answer);
    return askQuestion(question);
};

const askAllQuestions = _.reduce((t, q) => {
    return t ? t.chain(answer => logAnswerAskNextQuestion(answer, q)) : askQuestion(q);
}, undefined);

const getAllQuestions = _.map(_.prop('ask'));

const mak = (listOfQuestions) => askAllQuestions(getAllQuestions(listOfQuestions));

mak(test).fork(console.error, logAnswer);




