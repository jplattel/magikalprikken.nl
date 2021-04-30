<div class="card card-{type}" class:border-success="{confetti}" class:text-success="{confetti}">
    {#if image}
        <img class="card-img-top" src="/images/{image}" alt="{image}">
    {/if}
    <div class="card-body">
        <h3 class="card-title mb-3">{text}</h3>
        {#if description} 
            <p class="card-text">{@html description}</p>
        {/if}

        {#if link} 
            <p class="card-text">
                <i>Check voor de zekerheid <a href="{link}">
                de tabel op Rijksoverheid.nl</a></i>
            </p>
        {/if}
    </div>
</div>

<script>
    export let description;
    export let type;
    export let text;
    export let link;
    export let confetti;
    export let image;
</script>