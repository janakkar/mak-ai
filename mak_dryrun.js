const { mak, logAnswer } = require('./mak');

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