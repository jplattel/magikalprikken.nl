<main class="container">
	<h1 class="text-center">Mag ik al een prik? 💉</h1>	
	<p>Nouja bijna! De website is nog in ontwikkeling :D</p>
	
	<svelte:component this={steps[state].type} {...steps[state]}/>

</main>

<script>
	import Question from './components/Question.svelte'
	import Answer from './components/Answer.svelte'
	import steps from "./tree";
	
	let state = '1';
	console.log(steps)
</script>