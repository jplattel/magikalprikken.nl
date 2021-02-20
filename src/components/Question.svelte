<div class="card card-{type}" >
    <div class="card-body">
        <h3 class="card-title">{text}</h3>
        {#if description} 
            <p class="card-text">{description}</p>
        {/if}
        <div class="btn-group btn-group-lg d-flex" role="group" aria-label="Antwoorden">
            {#each answers as answer}
                <button type="button" class="btn {answer.class}" on:click={clickAnswer(answer.newState)}>{answer.text}</button>
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