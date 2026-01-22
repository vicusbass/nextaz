<script lang="ts">
  import type { BundleCartItem, BundleConfig } from '../../types/cart';
  import { removeFromCart, formatPrice } from '../../stores/cart';
  import { editBundle } from '../../stores/bundleConfigurator';
  import { SGR_DEPOSIT } from '../../config';

  interface Props {
    item: BundleCartItem;
    bundleConfigs: BundleConfig[];
  }

  let { item, bundleConfigs }: Props = $props();

  function handleRemove() {
    removeFromCart(item.id, 'bundle');
  }

  function handleEdit() {
    // Find the matching bundle config
    const bundleConfig = bundleConfigs.find((b) => b.slug === item.bundleSlug);
    if (bundleConfig) {
      editBundle(item.id, bundleConfig, item.selections);
    }
  }

  // Calculate total SGR for all bottles in the bundle
  const totalSgr = $derived(item.bottleCount * SGR_DEPOSIT);
</script>

<article class="bundle-cart-item">
  <div class="bundle-cart-header">
    <div class="bundle-cart-info">
      <h3 class="bundle-cart-name">{item.name}</h3>
      <span class="bundle-cart-bottles">{item.bottleCount} sticle</span>
    </div>
    <button
      class="bundle-cart-remove"
      onclick={handleRemove}
      aria-label="Elimină {item.name} din coș"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <div class="bundle-cart-wines">
    {#each item.selections as wine (wine.productId)}
      <div class="bundle-cart-wine">
        <div class="bundle-cart-wine-info">
          <span class="bundle-cart-wine-name">{wine.productName}</span>
          <span class="bundle-cart-wine-qty">x{wine.quantity}</span>
        </div>
        <div class="bundle-cart-wine-pricing">
          <span class="bundle-cart-wine-price">
            {formatPrice(wine.discountedPrice * wine.quantity)}
          </span>
          <span class="bundle-cart-wine-sgr">
            SGR: {formatPrice(wine.quantity * SGR_DEPOSIT)}
          </span>
        </div>
      </div>
    {/each}
  </div>

  <div class="bundle-cart-footer">
    <div class="bundle-cart-totals">
      <div class="bundle-cart-subtotal">
        <span>Subtotal:</span>
        <span>{formatPrice(item.totalPrice)}</span>
      </div>
      <div class="bundle-cart-sgr">
        <span>Garanție SGR ({item.bottleCount} sticle):</span>
        <span>{formatPrice(totalSgr)}</span>
      </div>
      <div class="bundle-cart-total">
        <span>Total pachet:</span>
        <span>{formatPrice(item.totalPrice + totalSgr)}</span>
      </div>
    </div>
    <button class="bundle-cart-edit" onclick={handleEdit}>
      Editează
    </button>
  </div>
</article>
