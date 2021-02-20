<div class="card card-{type}" >
    <div class="card-body">
        <h3 class="card-title">{text}</h3>
        {#if description} 
            <p class="card-text">{description}</p>
        {/if}
    </div>
</div>

<script>
    export let description;
    export let type;
    export let text;
</script>