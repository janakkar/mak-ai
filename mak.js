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
    rl.question(question.ask, (answer) => res({question, answer})));

const logAnswer = ({question, answer}) => {
    console.log(`Your answer for question: ${question.ask}, is: ${answer}`);
};

const logAnswerAskNextQuestion = ({question, answer}, nextQuestion) => {
    logAnswer({question, answer});
    const followUpQuestion = question[answer];
    return followUpQuestion ?
        askQuestion(followUpQuestion).chain(answered => logAnswerAskNextQuestion(answered, nextQuestion))
        : askQuestion(nextQuestion);
};

const askAllQuestions = _.reduce((task, nextQuestion) => {
    return task ? task.chain(answered =>
        logAnswerAskNextQuestion(answered, nextQuestion)) : askQuestion(nextQuestion);
}, undefined);

const getAllQuestions = _.map(_.identity);

const mak = (listOfQuestions) => askAllQuestions(getAllQuestions(listOfQuestions));

mak(test).fork(console.error, logAnswer);




