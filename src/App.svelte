<main class="container text-center">
	<div class="row justify-content-md-center">
		<div class="col-md-4">
			<h1 class="mt-5">Mag ik al een prik? 💉</h1>	
			<p class="text-start">
				<i>Goeie vraag!</i> In plaats van de tabellen van de rijksoverheid door te speuren 
				helpen wij jou met een paar vragen te bepalen wanneer je in aanmerking komt voor 
				een <strong>COVID-19 vaccin</strong>! 
			</p>
			
			<hr>

			<svelte:component this={steps[state].type} {...steps[state]} on:answer={setState}/>
			
			<button class="btn btn-secondary mt-3" id="reset" on:click={reset}>Reset ⟲</button>

			<hr>

			<p class="text-start">
				Nieuwsgierig wie dit heeft gemaakt en waarom? Lees er <a href="#">hier</a> meer over! 
				Vragen of opmerkingen, <a href="https://github.com/jplattel/magikalprikken.nl">maak een issue aan op Github</a>!
				👋
			</p>
		</div>
	</div>
</main>

<script>
	import Question from './components/Question.svelte'
	import Answer from './components/Answer.svelte'
	import steps from "./tree";
	
	let state = '1';

	const setState = (event) => {
		console.log('Setting state:', event.detail.newState)
		state = event.detail.newState;
	}

	const reset = () => state = 1;

</script>

<style>
	main{
		margin-top: 40px;
	}
</style>