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
        "ask": "What is it?",
        "hm": {
            "ask": "Think harder..."
        }
    }
}, {
    "ask": "Anything else?"
},
{
    "ask": "You sure?",
    "id": 1003
}];

const askQuestion = (question, answers) => new Task((rej, res) =>
    rl.question(question.ask, (answer) => res({question, answer, answers})));

const logAnswer = ({question, answer}) => {
    console.log(`Your answer for question: ${question.ask}, is: ${answer}`);
};

const collectAnswers = ({question, answer, answers}) => {
    logAnswer({question, answer});
    return {question, answer,
        'answers': _.append({question, answer}, answers)};
}

const collectAnswerAskNextQuestion = ({question, answer, answers}, nextQuestion) => {
    const collectedAnswers = collectAnswers({question, answer, answers}).answers;
    const followUpQuestion = question[answer];
    return followUpQuestion ?
        askQuestion(followUpQuestion, collectedAnswers).chain(answered =>
            collectAnswerAskNextQuestion(answered, nextQuestion))
        : askQuestion(nextQuestion, collectedAnswers);
};

const askAllQuestions = _.reduce((task, nextQuestion) => {
    return task ? task.chain(answered =>
        collectAnswerAskNextQuestion(answered, nextQuestion)) : askQuestion(nextQuestion, []);
}, undefined);


const mak = askAllQuestions;

mak(test).fork(console.error, (answered) => {
    const collected = collectAnswers(answered);
    
    console.log('-----------------------------------');
    console.log('YOUR ANSWERS');
    console.log('-----------------------------------');
    collected.answers.map(logAnswer);
});