const _ = require('ramda');
const readline = require('readline');
const Task = require('data.task');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Turns a question asking into a Task. Asking a question requires a context 
 * that contains the question to be asked and list of all previously answered questions.
 * 
 * @param {Context} context - {answers: Array<Answered>, question: Question, answer: string}
 */
const questionToTask = (context) => new Task((rej, res) =>
    rl.question(context.question.ask, (answer) => {
        context.answer = answer;
        context.answers = _.append({ question: context.question, answer }, context.answers);
        res(context);
    }));
/**
 * Generator function that creates question asking tasks. It generates follow up questions based on previous answers.
 **/
const createQuestionsGenerator = (questions, context) =>
    function* () {
        for (i in questions) {
            context.question = questions[i];
            const followUpContext = yield questionToTask(context);
            const followUpQuestions = getFollowUpQuestions(followUpContext);
            if (followUpQuestions) {
                yield* createQuestionsGenerator(followUpQuestions, followUpContext);
            }
        }
    }();

const getFollowUpQuestions = (context) => {
    return context.question[context.answer];
};

/**
 * The question asking app.
 * 
 * @param {!Array<Question>} questions - graph of questions to ask 
 * @param {Context} context - structure that collects all answered questions
 */
const mak = (questions, context = { answers: [] }) => {
    const gen = createQuestionsGenerator(questions, context);
    const step = value => {
        const result = gen.next(value)
        return result.done ? Task.of(value) : result.value.chain(step)
    };
    return step();
}

const logAnswer = ({ question, answer }) => {
    console.log(`Your answer for question: ${question.ask}, is: ${answer}`);
};

module.exports = { mak, logAnswer };
