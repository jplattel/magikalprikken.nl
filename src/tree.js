import Question from './components/Question.svelte';
import QuestionList from './components/QuestionList.svelte';
import Answer from './components/Answer.svelte';

export default {
    '1': {
        'type': Question,
        'text': 'Werk je in de zorg?',
        'description': 'Als zorgverlener',
        'answers': [
            {
                'text': "Ja",
                'class': 'btn-success',
                'newState': '100'
            },
            {
                'text': "Nee",
                'class': 'btn-danger',
                'newState': '2'
            }
        ]
    },
    '2': {
        'type': Question,
        'text': 'Ben je 60 jaar of ouder?',
        'description': 'Longer text here....',
        'answers': [
            {
                'text': "Ja",
                'class': 'btn-success',
                'newState': '200'
            },
            {
                'text': "Nee",
                'class': 'btn-danger',
                'newState': '3'
            }
        ]
    },
    '3': {
        'type': Question,
        'text': 'Woon je in een kleinschalige woonvorm of heb je een verstandelijke beperking en woon je in een instelling?',
        'description': 'Longer text here....',
        'answers': [
            {
                'text': "Ja",
                'class': 'btn-success',
                'newState': '300'
            },
            {
                'text': "Nee",
                'class': 'btn-danger',
                'newState': '4'
            }
        ]
    },
    '4': {
        'type': Question,
        'text': 'Woon e op st. Eustasius of Saba?',
        'description': 'Longer text here....',
        'answers': [
            {
                'text': "Ja",
                'class': 'btn-success',
                'newState': '400'
            },
            {
                'text': "Nee",
                'class': 'btn-danger',
                'newState': '500'
            }
        ]
    },
    '100': {
        'type': QuestionList,
        'text': 'Bij wat voor soort zorg organisatie werkt u?',
        'answers': [
            {
                'text': "Een verpleeghuis",
                'newState': '102'
            },
            {
                'text': "Directe COVID zorg in een ziekenhuis",
                'newState': '103'
            },
            {
                'text': "GGZ en crisisdienst",
                'newState': '102'
            },
            {
                'text': "Wijkverpleging, WMO ondersteuning of PGB zorgverleners",
                'newState': '102'
            },
            {
                'text': "Een ambulance",
                'newState': '103'
            },
            {
                'text': "Klinish medische specialistische, revalidatie of gehandicaptenzorg",
                'newState': '102'
            },
            {
                'text': "Bij een zorgorganisatie op de waddeneilanden",
                'newState': '102'
            },
            {
                'text': "Bij een zorgorganisatie op DE BES & CAS eilanden",
                'newState': '102'
            },
        ]
    },
    '101': {
        'type': Answer,
        'text': 'Ja! Je ontvangt een brief per post voor een datum!'
    },
    '102': {
        'type': Answer,
        'text': 'Ja! Je krijgt een uitnodiging voor een vaccin bij een GGD priklocatie'
    },
    '103': {
        'type': Answer,
        'text': 'Vraag je leidinggevende voor een vaccin in het ziekenhuis'
    },
    '200': {
        'type': Answer,
        'text': 'Je ontvangt een bericht wanneer je een vaccin krijgt',
        'description': 'Je ontvangt een brief wanneer je een vaccin krijgt of je krijgt een bericht van je huisarts'
    },
    '300': {
        'type': Answer,
        'text': 'Vraag je instellings arts wanneer je een vaccin kunt krijgt'
    },
    '400': {
        'type': Answer,
        'text': 'Je ontvangt een brief van de GGD voor het vaccin'
    },
    '500': {
        'type': Answer,
        'text': 'De verwachting is dat het vaccin vanaf mei beschikbaar is.'
    }
}
