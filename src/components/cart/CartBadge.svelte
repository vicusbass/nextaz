<script lang="ts">
  import { onMount } from 'svelte';
  import { cartCount, initializeCart, subscribeToCartChanges } from '../../stores/cart';

  let count = $state(0);
  let bouncing = $state(false);
  let prevCount = 0;

  onMount(() => {
    initializeCart();
    subscribeToCartChanges();

    const unsub = cartCount.subscribe((value) => {
      if (value > prevCount && prevCount > 0) {
        bouncing = true;
      }
      prevCount = count;
      count = value;
    });

    return unsub;
  });

  function onAnimationEnd() {
    bouncing = false;
  }
</script>

{#if count > 0}
  <span
    class="badge"
    class:badge-bounce={bouncing}
    aria-label="{count} {count === 1 ? 'produs' : 'produse'} în coș"
    onanimationend={onAnimationEnd}
  ></span>
{/if}

<style>
  .badge {
    position: absolute;
    top: -0.25rem;
    right: -0.25rem;
    width: 0.625rem;
    height: 0.625rem;
    background: #dc2626;
    border-radius: 9999px;
  }

  .badge-bounce {
    animation: cart-badge-bounce 0.4s ease-out;
  }

  @keyframes cart-badge-bounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.8); }
    50% { transform: scale(0.8); }
    70% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
</style>
