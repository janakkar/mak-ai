const _ = require('ramda');
const readline = require('readline');
const Task = require('data.task');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question, context = { answers: [] }) => new Task((rej, res) =>
    rl.question(question.ask, (answer) => res({ question, answer, context })));

const logAnswer = ({question, answer}) => {
    console.log(`Your answer for question: ${question.ask}, is: ${answer}`);
};

const collectAnswers = (answered) => {
    const { question, answer } = answered;
    logAnswer(answered);
    answered.context.answers.push({ question, answer });
    return answered;
}

const askFollowUpQuestions = (answered, nextQuestion) => {
    const { question, answer } = answered;
    const updatedContext = collectAnswers(answered).context;
    const followUpQuestion = question[answer];

    return followUpQuestion ?
        askQuestion(followUpQuestion, updatedContext).chain(answered =>
            askFollowUpQuestions(answered, nextQuestion))
        : askQuestion(nextQuestion, updatedContext);
};

const askAllQuestions = _.reduce((task, nextQuestion) => {
    return task ? task.chain(answered =>
        askFollowUpQuestions(answered, nextQuestion)) : askQuestion(nextQuestion);
}, undefined);


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
const mak = askAllQuestions;
mak(test).fork(console.error, (answered) => {
    const collected = collectAnswers(answered);

    console.log('-----------------------------------');
    console.log('YOUR ANSWERS');
    console.log('-----------------------------------');
    collected.context.answers.map(logAnswer);
});