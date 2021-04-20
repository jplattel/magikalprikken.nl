<div class="card card-{type}" >
    <div class="card-body">
        <h2 class="card-title mb-3">{text}</h2>
        {#if description} 
            <p class="card-text">{description}</p>
        {/if}
        <div role="group" aria-label="Antwoorden">
            {#each answers as answer}
                <button style="width: 40%; margin: 10px;" type="button" class="btn-lg btn {answer.class}" on:click={clickAnswer(answer.newState)}>{answer.text}</button>
            {/each}
        </div>
    </div>
</div>

<script>
    export let description;
    export let type;
    export let text;
    export let answers;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    function clickAnswer(newState) {
		dispatch('answer', {
			newState: newState
		});
	}
</script>