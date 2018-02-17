const _ = require('ramda');
const readline = require('readline');
const Task = require('data.task');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const logAnswer = ({ question, answer }) => {
    console.log(`Your answer for question: ${question.ask}, is: ${answer}`);
};

const questionToTask = (context) => new Task((rej, res) =>
    rl.question(context.question.ask, (answer) => {
        context.answer = answer;
        context.answers = _.append({ question: context.question, answer }, context.answers);
        res(context);
    }));

const createQuestionsGenerator = (questions, context) =>
    function* () {
        for (i in questions) {
            context.question = questions[i];
            const followUpContext = yield questionToTask(context);
            const followUpQuestions = getFollowUpQuestions(followUpContext);
            if (followUpQuestions) {
                console.log(followUpQuestions);
                yield* createQuestionsGenerator(followUpQuestions, followUpContext);
            }
        }
    }();

const getFollowUpQuestions = (context) => {
    return context.question[context.answer];
};

const mak = (questions, context = { answers: [] }) => {
    const gen = createQuestionsGenerator(questions, context);
    const step = value => {
        const result = gen.next(value)
        return result.done ? Task.of(value) : result.value.chain(step)
    };
    return step();
}

//module.exports = { askAllQuestions, collectAnswers };

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
mak(test)
    .fork(console.error, (context) => {
        console.log(context);
        console.log('-----------------------------------');
        console.log('YOUR ANSWERS');
        console.log('-----------------------------------');
        context.answers.map(logAnswer);
    });