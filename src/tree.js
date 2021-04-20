import Question from './components/Question.svelte';
import QuestionList from './components/QuestionList.svelte';
import Answer from './components/Answer.svelte';

export default {
    '1': {
        'type': Question,
        'text': 'Werk je in de zorg?',
        'description': 'Als zorgverlener, arts of andere uitvoerende rol?',
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
        'description': 'Je leeftijd bepaalt wanneer je het vaccin krijgt',
        'answers': [
            {
                'text': "Ja",
                'class': 'btn-success',
                'newState': '200'
            },
            {
                'text': "Nee",
                'class': 'btn-danger',
                'newState': '2.5'
            }
        ]
    },
    '2.5': {
        'type': Question,
        'text': 'Ben tussen de 18 - 60 jaar en heb je een medische indicatie?',
        'answers': [
            {
                'text': "Ja",
                'class': 'btn-success',
                'newState': '201'
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
        'text': 'Woon je in een kleinschalige woonvorm OF heb je een verstandelijke beperking en woon je in een instelling?',
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
        'text': 'Woon je op st. Eustasius of Saba?',
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
        'text': 'Bij wat voor soort zorg organisatie werk je?',
        'description': 'En in sommige gevallen wat is je functie?',
        'answers': [
            {
                'text': "Een verpleeghuis",
                'newState': '102'
            },
            {
                'text': "Directe COVID-19 zorg in een ziekenhuis",
                'newState': '103'
            },
            {
                'text': "GGZ en crisisdienst",
                'newState': '102'
            },
            {
                'text': "Wijkverpleging, WMO ondersteuning of PGB zorgverleners",
                'newState': '104'
            },
            {
                'text': "Op de ambulance",
                'newState': '103'
            },
            {
                'text': "Klinish medische specialistische revalidatie of gehandicaptenzorg",
                'newState': '102'
            },
            {
                'text': "Bij een zorgorganisatie op de waddeneilanden",
                'newState': '105'
            },
            {
                'text': "Bij een zorgorganisatie op de BES & CAS eilanden",
                'newState': '102'
            },
            {
                'text': "Wel in de zorg maar geen van bovenstaande",
                'newState': '2'
            }
        ]
    },
    '101': {
        'type': Answer,
        'text': 'Vanaf mei is het mogelijk dat je het vaccin zou kunnen ontvangen',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
        'confetti': true,
        'image': 'waiting.gif'
    },
    '102': {
        'type': Answer,
        'text': 'Je krijgt een uitnodiging voor een vaccin bij een GGD priklocatie',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
        'confetti': true,
        'image': 'mail.gif'
    },
    '103': {
        'type': Answer,
        'text': 'Vraag je leidinggevende voor een vaccin in het ziekenhuis',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
        'confetti': true,
        'image': 'vaccine.gif'
    },
    '104': {
        'type': Answer,
        'text': 'Vanaf begin maart kan je een vaccin krijgen',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
        'image': 'waiting.gif'
    },
    '105': {
        'type': Answer,
        'text': 'Je kan het vaccin krijgen via de GGD of de huisarts',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers',
        'confetti': true,
        'image': 'vaccine.gif'
    },
    '200': {
        'type': Answer,
        'text': 'Je ontvangt een bericht wanneer je een vaccin kan ontvangen',
        'description': 'Je ontvangt een brief wanneer je een vaccin krijgt of je krijgt een bericht van je huisarts',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
        'confetti': true,
        'image': 'mail.gif'
    },
    '201': {
        'type': Answer,
        'text': 'Vanaf eind juni kan je een vaccin krijgen via de huisarts',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
        'image': 'vaccine.gif'
    },
    '300': {
        'type': Answer,
        'text': 'Vraag je instellings arts wanneer je een vaccin kan ontvangen',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
        'image': 'vaccine.gif'
    },
    '400': {
        'type': Answer,
        'text': 'Je ontvangt een brief van de GGD voor het vaccin',
        'description': 'Je ontvangt een brief wanneer je een vaccin krijgt of je krijgt een bericht van je huisarts',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
        'confetti': true,
        'image': 'mail.gif'
    },
    '500': {
        'type': Answer,
        'text': 'De verwachting is dat het vaccin vanaf mei beschikbaar is.',
        'description': 'Zodra er speciekere data beschikbaar is vullen we dit aan! #duurtlang',
        'link': 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken',
        'image': 'waiting.gif'
    }
}
