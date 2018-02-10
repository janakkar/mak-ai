const _ = require('ramda');
const readline = require('readline');
const Task = require('data.task');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question, context = { answers: [] }) => new Task((rej, res) =>
    rl.question(question.ask, (answer) => res({ question, answer, context })));

const logAnswer = ({ question, answer }) => {
    console.log(`Your answer for question: ${question.ask}, is: ${answer}`);
};

const collectAnswers = (answered) => {
    const { question, answer } = answered;
    answered.context.answers.push({ question, answer });
    return answered;
}

const askFollowUpQuestions = (answered, nextQuestion) => {
    const { question, answer } = answered;
    const updatedContext = collectAnswers(answered).context;
    const followUpQuestions = question[answer];
    if (followUpQuestions) {
        let followUpQuestionsTask =
            _.reduce((task, followUpQuestion) =>
                task ? task.chain(answered => askFollowUpQuestions(answered, followUpQuestion))
                    : askQuestion(followUpQuestion, updatedContext), undefined)(followUpQuestions);
        followUpQuestionsTask = followUpQuestionsTask
            .chain(answered => askFollowUpQuestions(answered, nextQuestion));
        return followUpQuestionsTask;
    } else if (nextQuestion) {
        return askQuestion(nextQuestion, updatedContext);
    }
    return new Task((rej, res) => res(answered));
};

const askAllQuestions = (questions) => (_.reduce((task, nextQuestion) => {
    return task ? task.chain(answered =>
        askFollowUpQuestions(answered, nextQuestion)) : askQuestion(nextQuestion);
}, undefined)(questions)).chain(answered => askFollowUpQuestions(answered, null));

module.exports = { askAllQuestions, collectAnswers };

const test = [{
    "ask": "Anything I need to know about?",
    "yes": [{
        "ask": "What is it?",
        "hm": [{
            "ask": "Think harder...?",
        }]
    }, {
        "ask": "I have too many questions?"
    }]
}, {
    "ask": "Anything else?"
},
{
    "ask": "You sure?",
    "no": [{
        "ask": "What are you waiting for?"
    }]
}];
const mak = askAllQuestions;
mak(test).fork(console.error, (answered) => {
    console.log('-----------------------------------');
    console.log('YOUR ANSWERS');
    console.log('-----------------------------------');
    answered.context.answers.map(logAnswer);
});