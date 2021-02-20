import Question from './components/Question.svelte';
import Answer from './components/Answer.svelte';

export default {
    '1': {
        'type': Question,
        'text': 'Werk je in de zorg?'
    },
    '2': {
        'type': Question,
        'text': 'Ben je 60 jaar of ouder?'
    },
    '3': {
        'type': Question,
        'text': 'Question 3?'
    },
    '4': {
        'type': Question,
        'text': 'Question 4?'
    },
    '5': {
        'type': Question,
        'text': 'Question 5?'
    },
    '6': {
        'type': Question,
        'text': 'Question 6?'
    },
    '100': {
        'type': Answer,
        'text': 'Ja! Per direct! Neem contact op met je leidingevende!'
    },
    '101': {
        'type': Answer,
        'text': 'Ja! Je ontvangt een brief per post voor een datum!'
    },
    '102': {
        'type': Answer,
        'text': 'Ja in maart neemt de huisarts contact met je opt!'
    },
    '900': {
        'type': Answer,
        'text': 'Voorlopig nog niet, de medicijn voorraad is te beperkt om een datum te noemen...'
    },
}
