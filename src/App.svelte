<main class="container text-center">
	<div class="row justify-content-md-center">
		<h1 class="my-5">Mag ik al een prik? 💉</h1>	

		{#if page == 'start'}
			<div class="col-md-6">	
				<p class="text-start">
					<i>Goeie vraag!</i> In plaats van de <a href="https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken">tabellen van</a> <a href="https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers">de Rijksoverheid</a> door te speuren 
					helpen wij jou met een paar vragen te bepalen wanneer je een <strong>COVID-19 vaccin</strong> kan krijgen! 
				</p>
				
				<hr>

				<svelte:component this={steps[state].type} {...steps[state]} on:answer={setState}/>
				
				<button class="btn btn-secondary mt-3" id="reset" on:click={reset}>Reset ⟲</button>

				<hr>

				<p class="text-start">
					Nieuwsgierig wie dit heeft gemaakt en waarom? Lees er <a href="#" on:click={readMore}>hier</a> meer over. 
					Vragen of opmerkingen, <a href="https://github.com/jplattel/magikalprikken.nl/issues">maak een issue aan op Github</a>!
					👋
					Vind je dit tof? Deel deze pagina dan op <a target="_blank" href="https://twitter.com/intent/tweet?url=https://magikaleenprik.nl/&text=Ook nieuwsgierig wanneer je een COVID-19 vaccin krijgt?&hashtags=covid19,magikaleenprik,magikalprikken,corona,vaccin">Twitter</a> 
					of <a href="https://www.facebook.com/sharer/sharer.php?u=https://magikaleenprik.nl/" target="_blank">Facebook</a>!
				</p>
			</div>
		{:else if page == 'info' }
			<div class="col-md-8">

				<h3>Over</h3>

				<div class="text-start">
					<h4>Waarom bestaat deze pagina?</h4>

					<p>
						De twee beschikbare tabellen van de Rijksoverheid zijn nogal groot en niet gebruiksvriendelijk als je wilt weten wanneer jij een COVID-19 vaccin zou kunnen krijgen.
						Met deze pagina hopen we dat meer mensen een duidelijk antwoord kunnen te geven. Let wel! Het is altijd goed om dubbel te checken bij de Rijksoverheid zelf, 
						hiervoor kun je de twee volgende tabellen gebruiken: 
					</p>

					<ul>
						<li><a href="https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-zorgmedewerkers">Zorgmedewerkers</a></li>
						<li><a href="https://www.rijksoverheid.nl/onderwerpen/coronavirus-vaccinatie/volgorde-van-vaccinatie-tegen-het-coronavirus/volgorde-vaccinatie-voor-mensen-die-niet-in-de-zorg-werken">Mensen die niet in de zorg werken</a></li>
					</ul>

					<p>Wij doen ons best om de volgorde en data up to date te houden, maar bevestig altijd de uitkomst met de data van de rijksoverheid zelf. Er kunnen dus absoluut geen rechten worden ontleend aan deze website.</p>

					<p>Vind je een bug of klopt de data niet meer? Laat het ons weten door het aanmaken <a href="https://github.com/jplattel/magikalprikken.nl/issues/new">van een Github issue</a>.</p>

					<h4>Wie heeft dit bedacht en waarom?</h4>

					<p>
						Wij (<a href="https://nl.linkedin.com/in/arjan-sammani">Arjan</a>, <a href="https://www.linkedin.com/in/chantalvankempen/">Chantal</a>, <a href="https://www.linkedin.com/in/channah-ruiter/">Channah</a> & <a href="https://jplattel.nl">Joost</a>) hebben in een avond dit systeem bedacht en gemaakt.
						Dit systeem heeft een simpel doel: mensen informeren wanneer en hoe ze worden geprikt. We
						snappen ook niet waarom het zo moeilijk was, maar nemen je graag mee in het verhaal. Het
						begon allemaal zo:
					</p>
					<p>
						De ouders van Chantal zouden mogelijk in aanmerking komen voor een COVID-19 vaccin, maar
						was dat ook echt zo? Chantal, opgeleid psychologe en nu consultant (waarom dit ertoe doet
						vertellen we je zo) keek op de website van de overheid maar kwam er niet uit. Krijgen haar
						ouders nou een prik? Wanneer dan? En hoe?
					</p>
					<p>
						Ze vroegen het Arjan (Arts, oprichter van <a href="http://vaccinatie-team.nl/">Stichting Vaccinatie-Team</a>, ervaring op Corona afdeling, 
						die zal het vast weten). Die wist het ook niet, dus
						hij keek op de website van de Rijksoverheid (die organisatie die ons ook een tip gaf over hoe
						voetbal te kijken en sneeuwballen te gooien tijdens corona). Samen met Channah (praktiserend
						psycholoog) en Joost (ondernemer & data strateeg) kwamen we er ook niet uit.
					</p>
					<p>
						Dus waarom is het belangrijk dat Chantal consultant is, Arjan arts, Channah psycholoog en
						Joost data-strateeg? Omdat deze club semi-intellectuelen het systeem blijkbaar ook niet
						snappen. Dan zijn wij niet slim genoeg of is de uitleg te complex (of beiden 🤓). 
					</p>
					<p>
						We denken niet dat het ligt aan de Rijksoverheid, maar aan de complexe onderneming die het vaccineren
						geworden is. Dus vandaar <a href="magikalprikken.nl">magikalprikken.nl</a> als oplossing!
					</p> 

					<h4>En verder?</h4>

					<p>
						Ben je van de Rijksoverheid en vind je het interessant om dit verder op te pakken zodat het wat makkelijk wordt? Of ben je van de pers en nieuwsgierig naar het hele verhaal? Volg dan <a href="https://twitter.com/jplattel">Joost op twitter</a> en stuur een DM/mention.
					</p>

					<h4>Privacy & data verzameling</h4>

					<p>
						Er wordt op deze website geen enkele data verzameld of verzonden naar derden. Geen cookies & geen tracking. 
						De pagina's staan gehost op <a href="https://github.com/jplattel/magikalprikken.nl">Github</a>, als mede ook alle code, dus die kan je zelf ook bekijken. 
						Daarnaast maken we gebruik van Cloudflare for caching en de beveiligde verbinding (<code>https</code>).</p>
				</div>
				
				<div class="d-grid mb-3">
					<a href="#" class="btn btn-outline-primary" on:click={readMore}>&laquo; terug naar de vragen</a>
				</div>
			</div>
		{/if}
	</div>
</main>

<script>
	import confetti from "canvas-confetti";
	import Question from './components/Question.svelte';
	import Answer from './components/Answer.svelte';
	import steps from "./tree";
	
	let state = '1';
	let page = 'start';

	// After answering, a question fires and 'answer' event for which we listen
	const setState = (event) => {
		console.debug('Setting state:', event.detail.newState);
		state = event.detail.newState;
		
		// TODO, still need to add confetti
		if (steps[state].confetti && steps[state].confetti === true) {
			console.debug("Throw some confetti!")
		}
	}

	// Back to the first question
	const reset = () => state = 1;

	// Instead of toggle, this allows for more pages if we need those later...
	const readMore = () => {
		if (page === 'start') {
			page = 'info'
		} else {
			page = 'start'
		}
	}

</script>

<style>
	main{
		margin-top: 40px;
	}
</style>