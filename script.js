/*
 * Maish Boutique Theme-Based Logo System
 *
 * Logo switching based on theme:
 * - Light mode: Uses logo with transparent/no background (MAISH_LOGO-1-removebg-preview.png)
 * - Dark mode: Uses logo with white background (MAISH_LOGO_WHITE_BG.png)
 *
 * You need to provide: MAISH_LOGO_WHITE_BG.png in your images folder
 */

document.addEventListener("DOMContentLoaded", () => {
  // ========== Countdown Section ==========
  const countdownSection = document.getElementById("countdownSection");
  const countdownTimer = document.getElementById("countdownTimer");
  const viewOffersBtn = document.getElementById("viewOffersBtn");
  const offerModal = document.getElementById("offerModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const offerItems = document.querySelector(".offer-items");

  const offerProducts = [
    {
      name: "Summer Floral Dress",
      image: "images/Women%27s%20Vacation%20Romantic%20Elegant%20Ditsy%20Floral%E2%80%A6.jpg",
      price: "Ksh5,599",
    },
    {
      name: "Denim Jacket",
      image: "images/PRICES%20MAY%20VARY_%20%E3%80%90Western%20Style%20Denim%20Jacket%E2%80%A6.jpg",
      price: "Ksh4,799",
    },
    {
      name: "Designer Handbag",
      image: "images/handbag.jpg",
      price: "Ksh10,399",
    },
    { name: "Running Shoes", image: "images/shoes.jpg", price: "Ksh7,199" },
  ];

  function isWeekend() {
    const day = new Date().getDay();
    return day === 5 || day === 6;
  }

  function updateCountdown() {
    if (!countdownSection || !countdownTimer) return;
    if (!isWeekend()) {
      countdownSection.style.display = "none";
      return;
    }
    countdownSection.style.display = "block";
    const now = new Date();
    const endOfWeekend = new Date(now);
    endOfWeekend.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeekend.setHours(23, 59, 59, 999);

    const diff = endOfWeekend - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownTimer.innerHTML = `
      <div>${days}<span>Days</span></div>
      <div>${hours}<span>Hours</span></div>
      <div>${minutes}<span>Minutes</span></div>
      <div>${seconds}<span>Seconds</span></div>
    `;
  }

  function showOfferModal() {
    if (!offerModal || !offerItems) return;
    offerItems.innerHTML = "";
    offerProducts.forEach((p) => {
      const item = document.createElement("div");
      item.classList.add("offer-item");
      item.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p class="price">${p.price}</p>
      `;
      offerItems.appendChild(item);
    });
    offerModal.style.display = "flex";
  }

  function hideOfferModal() {
    if (!offerModal) return;
    offerModal.style.display = "none";
  }

  if (viewOffersBtn) viewOffersBtn.addEventListener("click", showOfferModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", hideOfferModal);
  window.addEventListener("click", (e) => {
    if (e.target === offerModal) hideOfferModal();
  });

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // ========== Cart Section ==========
  const cartPreview = document.getElementById("cartPreview");
  const cartIcon = document.getElementById("cartIcon");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const cartItemsContainer = cartPreview ? cartPreview.querySelector(".cart-items") : null;
  const cartTotal = cartPreview ? cartPreview.querySelector(".cart-total span:last-child") : null;
  const viewCartWhatsappBtn = document.getElementById("viewCartWhatsappBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");

  // Initialize cart on page load
  const token = localStorage.getItem("token");
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("sessionId", sessionId);
  }

  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  let userId = null; // Will be set when user logs in

  console.log("Initializing cart...");
  if (cartPreview) {
    console.log("Cart preview element found, fetching cart...");
    fetchCart();
  } else {
    console.error("Cart preview element not found!");
  }

  function getLocalCart() {
    try {
      const cartData = localStorage.getItem(`cart_${userId || sessionId}`);
      const cart = cartData ? JSON.parse(cartData) : { items: [], totalPrice: 0 };
      console.log("Retrieved cart from localStorage:", cart);
      return cart;
    } catch (error) {
      console.warn("Error reading local cart:", error);
      return { items: [], totalPrice: 0 };
    }
  }

  function saveLocalCart(cart) {
    try {
      localStorage.setItem(`cart_${userId || sessionId}`, JSON.stringify(cart));
      console.log("Saved cart to localStorage:", cart);
    } catch (error) {
      console.warn("Error saving local cart:", error);
    }
  }

  async function fetchCart() {
    try {
      const res = await fetch(
        `https://maisha-boutique.onrender.com/cart?${
          userId ? `user=${userId}` : `sessionId=${sessionId}`
        }`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data && data.data) {
        renderCart(data.data);
        saveLocalCart(data.data); // Save to local storage as backup
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.warn("Error fetching cart:", error);
      // Use local cart on error
      const localCart = getLocalCart();
      renderCart(localCart);
    }
  }

  async function addToCart(name, price, image, quantity = 1) {
    console.log("addToCart called with:", name, price, image, quantity);
    // First, update local cart immediately for instant feedback
    const localCart = getLocalCart();
    console.log("Local cart before adding:", localCart);
    const existingItem = localCart.items.find(item => item.name === name);

    if (existingItem) {
      existingItem.quantity += quantity;
      console.log("Updated existing item quantity");
    } else {
      localCart.items.push({ name, price, image, quantity });
      console.log("Added new item to cart");
    }

    localCart.totalPrice = localCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log("Cart total price:", localCart.totalPrice);
    saveLocalCart(localCart);
    console.log("Cart saved to localStorage");
    renderCart(localCart);
    console.log("Cart rendered");
    showCart();
    console.log("Cart shown");

    // Then try to sync with server
    try {
      const res = await fetch("https://maisha-boutique.onrender.com/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          sessionId,
          name,
          price,
          image,
          quantity,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        saveLocalCart(data.data); // Update local cart with server data
        renderCart(data.data);
      }
    } catch (error) {
      console.warn("Network error syncing cart:", error);
      // Local cart is already updated, so user sees immediate feedback
    }
  }

  async function removeFromCart(name) {
    // Update local cart immediately
    const localCart = getLocalCart();
    localCart.items = localCart.items.filter(item => item.name !== name);
    localCart.totalPrice = localCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    saveLocalCart(localCart);
    renderCart(localCart);

    // Sync with server
    try {
      const res = await fetch(
        "https://maisha-boutique.onrender.com/cart/remove",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: userId, sessionId, name }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        saveLocalCart(data.data);
        renderCart(data.data);
      }
    } catch (error) {
      console.warn("Network error removing from cart:", error);
    }
  }

  async function updateQuantity(name, quantity) {
    // Update local cart immediately
    const localCart = getLocalCart();
    const item = localCart.items.find(item => item.name === name);
    if (item) {
      item.quantity = quantity;
      localCart.totalPrice = localCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      saveLocalCart(localCart);
      renderCart(localCart);
    }

    // Sync with server
    try {
      const res = await fetch("https://maisha-boutique.onrender.com/cart/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: userId, sessionId, name, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
          saveLocalCart(data.data);
          renderCart(data.data);
      }
    } catch (error) {
      console.warn("Network error updating quantity:", error);
    }
  }

  async function clearCart() {
    // Clear local cart immediately
    const emptyCart = { items: [], totalPrice: 0 };
    saveLocalCart(emptyCart);
    renderCart(emptyCart);

    // Sync with server
    try {
      const res = await fetch("https://maisha-boutique.onrender.com/cart/clear", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userId, sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        saveLocalCart(data.data);
        renderCart(data.data);
      }
    } catch (error) {
      console.warn("Network error clearing cart:", error);
    }
  }

  function renderCart(cart) {
    console.log("renderCart called with cart:", cart);

    // Check if cart preview elements exist
    if (!cartItemsContainer || !cartTotal) {
      console.log("Cart preview elements not found, skipping render");
      updateCartCount(cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0);
      return;
    }

    cartItemsContainer.innerHTML = "";
    if (!cart.items || cart.items.length === 0) {
      console.log("Cart is empty");
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      cartTotal.textContent = "Ksh0.00";
      updateCartCount(0);
      return;
    }
    console.log("Cart has items:", cart.items.length);
    cart.items.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
        <img loading="lazy" src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-price">Ksh${item.price} × ${item.quantity}</div>
        </div>
        <button class="remove-item" data-name="${item.name}">×</button>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    // attach remove handlers
    cartItemsContainer
      .querySelectorAll(".remove-item")
      .forEach((btn) =>
        btn.addEventListener("click", () => removeFromCart(btn.dataset.name))
      );
    cartTotal.textContent = `Ksh${cart.totalPrice.toFixed(2)}`;
    console.log("Cart total set to:", cartTotal.textContent);

    // Update cart count
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    console.log("Total items:", totalItems);
    updateCartCount(totalItems);

    // Update detailed cart view if it's open
    renderDetailedCart(cart);
  }

  function updateCartCount(count) {
    console.log("updateCartCount called with count:", count);
    const cartCountElements = document.querySelectorAll("#cartCount");
    console.log("Found cart count elements:", cartCountElements.length);
    cartCountElements.forEach((element, index) => {
      console.log("Updating cart count element", index, "to:", count);
      element.textContent = count;
      element.style.display = count > 0 ? "flex" : "none";
    });
  }

  function renderDetailedCart(cart) {
    const detailedCartItems = document.querySelector('.detailed-cart-items');
    if (!detailedCartItems) return;

    detailedCartItems.innerHTML = "";

    if (!cart.items || cart.items.length === 0) {
      detailedCartItems.innerHTML = "<p class='text-center'>Your cart is empty.</p>";
      return;
    }

    cart.items.forEach((item) => {
      const detailedItem = document.createElement("div");
      detailedItem.classList.add("detailed-cart-item");
      detailedItem.innerHTML = `
        <img loading="lazy" src="${item.image}" alt="${item.name}">
        <div class="detailed-cart-item-info">
          <h4>${item.name}</h4>
          <div class="item-details">
            <p>Size: ${item.size || 'Standard'}</p>
            <p>Color: ${item.color || 'Default'}</p>
          </div>
          <div class="item-quantity">
            <button class="quantity-btn minus" data-name="${item.name}">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn plus" data-name="${item.name}">+</button>
          </div>
        </div>
        <div class="item-total">
          <p class="item-price">Ksh${(item.price * item.quantity).toFixed(2)}</p>
          <button class="remove-item" data-name="${item.name}">Remove</button>
        </div>
      `;
      detailedCartItems.appendChild(detailedItem);
    });

    // Update cart summary
    const subtotal = cart.totalPrice;
    const shipping = 0; // You can adjust this based on your shipping logic
    const total = subtotal + shipping;

    const subtotalEl = document.querySelector('.subtotal-amount');
    const shippingEl = document.querySelector('.shipping-amount');
    const totalEl = document.querySelector('.total-amount');
    if (subtotalEl) subtotalEl.textContent = `Ksh${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `Ksh${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `Ksh${total.toFixed(2)}`;

    // Use event delegation to avoid duplicate listeners
    detailedCartItems.addEventListener('click', (e) => {
      const btn = e.target;
      if (btn.classList.contains('quantity-btn')) {
        const name = btn.dataset.name;
        const item = cart.items.find(i => i.name === name);
        if (!item) return;

        if (btn.classList.contains('minus') && item.quantity > 1) {
          updateQuantity(name, item.quantity - 1);
        } else if (btn.classList.contains('plus')) {
          updateQuantity(name, item.quantity + 1);
        }
      } else if (btn.classList.contains('remove-item')) {
        removeFromCart(btn.dataset.name);
      }
    });
  }

  // Initialize cart modal functionality
  const cartModal = document.getElementById('cartModal');
  const viewCartBtn = document.getElementById('viewCartBtn');
  const closeCartModalBtn = document.getElementById('closeCartBtn');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');
  const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');

  if (viewCartBtn && cartModal) {
    viewCartBtn.addEventListener('click', () => {
      cartModal.style.display = 'flex';
      hideCart(); // Hide preview when opening modal
      // Hide floating buttons
      const messageBtn = document.querySelector('.message-button-container');
      const tidioChat = document.getElementById('tidio-chat');
      if (messageBtn) messageBtn.style.display = 'none';
      if (tidioChat) tidioChat.style.display = 'none';
      // Fetch and render latest cart data
      fetchCart();
    });
  } else {
    console.warn('Cart modal or view cart button not found');
  }

  if(closeCartModalBtn && cartModal) {
    closeCartModalBtn.addEventListener('click', () => {
      cartModal.style.display = 'none';
      // Show floating buttons
      const messageBtn = document.querySelector('.message-button-container');
      const tidioChat = document.getElementById('tidio-chat');
      if (messageBtn) messageBtn.style.display = 'flex';
      if (tidioChat) tidioChat.style.display = 'block';
    });
  }

  if (continueShoppingBtn && cartModal) {
    continueShoppingBtn.addEventListener('click', () => {
      console.log('Continue Shopping button clicked');
      cartModal.style.display = 'none';
      // Show floating buttons
      const messageBtn = document.querySelector('.message-button-container');
      const tidioChat = document.getElementById('tidio-chat');
      if (messageBtn) messageBtn.style.display = 'flex';
      if (tidioChat) tidioChat.style.display = 'block';
    });
  } else {
    console.warn('Continue Shopping button or cart modal not found');
  }

  if (proceedToCheckoutBtn && cartModal) {
    proceedToCheckoutBtn.addEventListener('click', () => {
      console.log('Proceed to Checkout button clicked');
      showCheckoutModal();
      cartModal.style.display = 'none';
      // Keep floating buttons hidden for checkout
    });
  } else {
    console.warn('Proceed to Checkout button or cart modal not found');
  }

  window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.style.display = 'none';
      // Show floating buttons
      const messageBtn = document.querySelector('.message-button-container');
      const tidioChat = document.getElementById('tidio-chat');
      if (messageBtn) messageBtn.style.display = 'flex';
      if (tidioChat) tidioChat.style.display = 'block';
    }
  });

  // ========== Checkout Modal ==========
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutModalBtn = document.getElementById('closeCheckoutModal');
  const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
  const checkoutItems = document.querySelector('.checkout-items');
  const checkoutTotal = document.getElementById('checkoutTotal');

  function showCheckoutModal() {
    if (!checkoutModal || !checkoutItems || !checkoutTotal) return;

    // Hide floating buttons
    const messageBtn = document.querySelector('.message-button-container');
    const tidioChat = document.getElementById('tidio-chat');
    if (messageBtn) messageBtn.style.display = 'none';
    if (tidioChat) tidioChat.style.display = 'none';

    // Populate checkout items
    const cart = getLocalCart();
    checkoutItems.innerHTML = '';

    if (cart.items && cart.items.length > 0) {
      cart.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
          <div style="flex: 1;">
            <h4 style="margin: 0; font-size: 16px;">${item.name}</h4>
            <p style="margin: 5px 0; color: var(--text);">Quantity: ${item.quantity}</p>
          </div>
          <div style="font-weight: bold;">Ksh${(item.price * item.quantity).toFixed(2)}</div>
        `;
        checkoutItems.appendChild(itemDiv);
      });
      checkoutTotal.textContent = `Ksh${cart.totalPrice.toFixed(2)}`;
    } else {
      checkoutItems.innerHTML = '<p>Your cart is empty</p>';
      checkoutTotal.textContent = 'Ksh0.00';
    }

    checkoutModal.style.display = 'flex';
  }

  function hideCheckoutModal() {
    if (checkoutModal) {
      checkoutModal.style.display = 'none';
    }
  }

  if (closeCheckoutModalBtn) {
    closeCheckoutModalBtn.addEventListener('click', () => {
      hideCheckoutModal();
      // Show floating buttons
      const messageBtn = document.querySelector('.message-button-container');
      const tidioChat = document.getElementById('tidio-chat');
      if (messageBtn) messageBtn.style.display = 'flex';
      if (tidioChat) tidioChat.style.display = 'block';
    });
  }

  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener('click', () => {
      clearCart();
      hideCheckoutModal();
      alert('Payment to be confirmed! kindly use the WhatsApp button to make your order. we are experiencing payment gateway issues at the moment. Sorry for the inconvenience our customer. Thank you!');
    });
  }

  const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
  if (whatsappOrderBtn) {
    whatsappOrderBtn.addEventListener('click', () => {
      const cart = getLocalCart();
      if (!cart.items || cart.items.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      // Generate WhatsApp message
      let message = 'Hello! I would like to place an order:\n\n';

      cart.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Quantity: ${item.quantity}\n`;
        message += `   Price: Ksh${(item.price * item.quantity).toFixed(2)}\n\n`;
      });

      message += `Total: Ksh${cart.totalPrice.toFixed(2)}\n\n`;
      message += 'Please confirm my order. Thank you!';

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);

      // WhatsApp URL with the business number (using the same number from the floating button)
      const whatsappUrl = `https://wa.me/254799921036?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      hideCheckoutModal();
      // Show floating buttons
      const messageBtn = document.querySelector('.message-button-container');
      const tidioChat = document.getElementById('tidio-chat');
      if (messageBtn) messageBtn.style.display = 'flex';
      if (tidioChat) tidioChat.style.display = 'block';
    }
  });

  // Copy functionality
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
      const target = e.target.dataset.target;
      if (target) {
        navigator.clipboard.writeText(target).then(() => {
          // Visual feedback
          const originalText = e.target.textContent;
          e.target.textContent = 'Copied!';
          e.target.style.backgroundColor = 'var(--secondary)';
          setTimeout(() => {
            e.target.textContent = originalText;
            e.target.style.backgroundColor = '';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = target;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);

          const originalText = e.target.textContent;
          e.target.textContent = 'Copied!';
          e.target.style.backgroundColor = 'var(--secondary)';
          setTimeout(() => {
            e.target.textContent = originalText;
            e.target.style.backgroundColor = '';
          }, 2000);
        });
      }
    }
  });

  console.log("Found", addToCartButtons.length, "add-to-cart buttons");

  addToCartButtons.forEach((btn, index) =>
    btn.addEventListener("click", async (e) => {
      console.log("Add to cart button", index, "clicked");
      e.preventDefault();
      e.stopPropagation();

      const icon = btn.querySelector("i");
      if (icon && (icon.classList.contains("fa-shopping-cart") || icon.classList.contains("fa-check"))) {
        console.log("Proceeding to add to cart");

        try {
          const card = btn.closest(".product-card");
          if (!card) {
            console.error("Product card not found");
            return;
          }

          const nameElement = card.querySelector(".product-title");
          const priceElement = card.querySelector(".price");
          const imageElement = card.querySelector(".product-img img");

          if (!nameElement || !priceElement || !imageElement) {
            console.error("Required elements not found in product card");
            return;
          }

          const name = nameElement.textContent.trim();
          const priceText = priceElement.textContent.trim();
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
          const image = imageElement.src;

          if (!name || isNaN(price) || !image) {
            console.error("Invalid product data:", { name, price, image });
            return;
          }

          // Change to checkmark immediately for visual feedback
          if (icon) {
            icon.classList.remove("fa-shopping-cart");
            icon.classList.add("fa-check");
            btn.classList.add("added");
          }

          await addToCart(name, price, image, 1);

          console.log("Item added to cart:", name);

          // Update cart count
          const currentCart = getLocalCart();
          updateCartCount(currentCart.items.reduce((sum, item) => sum + item.quantity, 0));

          // Show cart preview briefly if it exists
          if (cartPreview) {
            showCart();
            setTimeout(() => {
              if (!cartVisible) {
                hideCart();
              }
            }, 2000);
          }

        } catch (error) {
          console.error("Error adding to cart:", error);
          // Revert on error
          if (icon) {
            icon.classList.remove("fa-check");
            icon.classList.add("fa-shopping-cart");
            btn.classList.remove("added");
          }
        }
      }
    })
  );

  // Cart toggling functionality
  let cartVisible = false;

  function showCart() {
    if (cartPreview) {
      cartPreview.classList.add("active");
      cartVisible = true;
      console.log("Cart preview shown");

      // Fetch cart data when showing, but don't fetch on initial page load call
      if (document.readyState === "complete") {
        fetchCart();
      }
    } else {
      console.log("Cart preview element not found, skipping showCart");
    }
  }

  function hideCart() {
    if (cartPreview) {
      cartPreview.classList.remove("active");
    }
    cartVisible = false;
  }

  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      if (cartVisible) {
        hideCart();
      } else {
        showCart();
      }
    });
  }

  // Close cart when clicking outside
  document.addEventListener("click", (e) => {
    if (cartVisible && cartPreview && !cartPreview.contains(e.target) && (!cartIcon || !cartIcon.contains(e.target))) {
      hideCart();
    }
  });

  // Close cart with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartVisible) {
      hideCart();
    }
  });

  // Theme toggle with 'T' key
  document.addEventListener("keydown", (e) => {
    if (e.key === "t" || e.key === "T") {
      e.preventDefault(); // Prevent default behavior
      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.click(); // Simulate click on theme toggle button
      }
    }
  });

  // Add a close button to the cart
  if (cartPreview) {
    const cartPreviewCloseBtn = document.createElement('button');
    cartPreviewCloseBtn.innerHTML = '×';
    cartPreviewCloseBtn.className = 'close-cart-btn';
    cartPreviewCloseBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text);
    `;
    cartPreview.insertBefore(cartPreviewCloseBtn, cartPreview.firstChild);

    cartPreviewCloseBtn.addEventListener('click', () => {
      hideCart();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      clearCart();
      if (cartPreview) cartPreview.classList.remove("active");
      alert("Cart cleared!");
    });
  }
  
  if (clearCartBtn) clearCartBtn.addEventListener("click", () => {
    clearCart();
    alert("Cart cleared!");
  });

  if (viewCartWhatsappBtn) {
    viewCartWhatsappBtn.addEventListener("click", () => {
      const cart = getLocalCart();
      if (!cart.items || cart.items.length === 0) return alert("Cart is empty!");
      let msg = "Hello, I would like to order:\n";
      cart.items.forEach((i) => {
        msg += `\n- ${i.name}: Ksh${i.price} × ${i.quantity}`;
      });
      msg += `\n\nTotal: Ksh${cart.totalPrice.toFixed(2)}`;
      window.open(
        `https://wa.me/+254799921036?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    });
  }

  // ========== Account Section ==========
  const accountBtn = document.getElementById("accountBtn");
  const accountModal = document.getElementById("accountModal");
  const closeAccountModalBtn = document.getElementById("closeAccountModalBtn");
  const userProfileIcon = document.getElementById("userProfileIcon");
  const userProfileModal = document.getElementById("userProfileModal");
  const userEmail = document.getElementById("userEmail");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const showSignup = document.getElementById("showSignup");
  const showLogin = document.getElementById("showLogin");
  const loginEl = document.getElementById("login");
  const signupEl = document.getElementById("signup");
  const signOutBtn = document.getElementById("signOutBtn");
  let loggedIn = false,
    userEmailValue = "";

  if (accountBtn) {
    accountBtn.addEventListener("click", () => {
      if (loggedIn) {
        if (loginForm) loginForm.style.display = "none";
        if (signupForm) signupForm.style.display = "none";
        if (userProfileModal) userProfileModal.style.display = "block";
        if (userEmail) userEmail.textContent = userEmailValue;
      } else {
        if (loginForm) loginForm.style.display = "block";
        if (signupForm) signupForm.style.display = "none";
        if (userProfileModal) userProfileModal.style.display = "none";
      }
      if (accountModal) accountModal.style.display = "flex";
    });
  }

  if (closeAccountModalBtn) {
    closeAccountModalBtn.addEventListener(
      "click",
      () => {
        if (accountModal) accountModal.style.display = "none";
      }
    );
  }
  if (showSignup) {
    showSignup.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginForm) loginForm.style.display = "none";
      if (signupForm) signupForm.style.display = "block";
    });
  }

  if (showLogin) {
    showLogin.addEventListener("click", (e) => {
      e.preventDefault();
      if (signupForm) signupForm.style.display = "none";
      if (loginForm) loginForm.style.display = "block";
    });
  }

  if (loginEl) {
    loginEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = loginEl.querySelector('input[type="email"]');
      const passwordInput = loginEl.querySelector('input[type="password"]');
      if (!emailInput || !passwordInput) return;

      const email = emailInput.value;
      const password = passwordInput.value;
    try {
      const res = await fetch(
        "https://maisha-boutique.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        userId = data.user?.id || data.id || email; // Set userId from response
        userEmailValue = email;
        showUserProfile(email);
        if (accountModal) accountModal.style.display = "none";
      } else {
        alert(data.error || "Login failed Invalid credentials");
      }
    } catch (error) {
      console.warn("Login error:", error);
      alert("Server error. Please try again.");
    }
    });
  }

  if (signupEl) {
    signupEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Signup form submitted ✅");
      const emailInput = signupEl.querySelector('input[type="email"]');
      const passwordInput = signupEl.querySelector('input[type="password"]');
      const nameInput = signupEl.querySelector('input[type="text"]');
      if (!emailInput || !passwordInput || !nameInput) return;

      const email = emailInput.value;
      const password = passwordInput.value;
      const name = nameInput.value;
    try {
      const res = await fetch(
        "https://maisha-boutique.onrender.com/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        userId = data.user?.id || data.id || email; // Set userId from response
        showUserProfile(email);
        if (accountModal) accountModal.style.display = "none";
      } else {
        alert(data.error || "Signup failed user already exists");
      }
    } catch (error) {
      console.warn("Signup error:", error);
      alert("Server error. Please try again.");
    }
    });
  }

  function showUserProfile(email) {
    if (userProfileIcon) {
      userProfileIcon.textContent = email.charAt(0).toUpperCase();
      userProfileIcon.style.display = "flex";
    }
    if (accountBtn) {
      const accountIcon = accountBtn.querySelector("i");
      if (accountIcon) accountIcon.style.display = "none";
    }
    loggedIn = true;
  }

  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      if (userProfileIcon) userProfileIcon.style.display = "none";
      if (accountBtn) {
        const accountIcon = accountBtn.querySelector("i");
        if (accountIcon) accountIcon.style.display = "block";
      }
      loggedIn = false;
      userId = null; // Reset userId
      userEmailValue = "";
      if (loginEl) loginEl.reset();
      if (signupEl) signupEl.reset();
      if (accountModal) accountModal.style.display = "none";
      localStorage.removeItem("token");
    });
  }

  // ==========(menu, theme, account, back-to-top) ==========
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");

  // Enhanced theme toggle functionality for all pages
  function initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
  
    // Set initial theme - default to light mode for first-time visitors
    if (savedTheme) {
      document.body.classList.toggle('dark-mode', savedTheme === 'dark');
      updateThemeIcon(savedTheme === 'dark');
    } else {
      // Default to light mode for new visitors
      document.body.classList.remove('dark-mode');
      updateThemeIcon(false);
      // Save light as the default theme
      localStorage.setItem('theme', 'light');
    }
  
    // Listen for system theme changes (only if user hasn't manually set a preference)
    prefersDark.addEventListener('change', (e) => {
      // Only apply system preference if no saved preference exists
      if (!localStorage.getItem('theme')) {
        document.body.classList.toggle('dark-mode', e.matches);
        updateThemeIcon(e.matches);
      }
    });
  
    // Ensure theme is applied immediately on page load
    const currentTheme = localStorage.getItem('theme') || 'light';
    const isDark = currentTheme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    updateThemeIcon(isDark);
  }
  
  // Listen for theme changes across all tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      const isDark = e.newValue === 'dark';
      document.body.classList.toggle('dark-mode', isDark);
      updateThemeIcon(isDark);
      updateLogoForTheme(isDark);
    }
  });

  function updateThemeIcon(isDark) {
    if (!themeToggle) return;
    const themeIcon = themeToggle.querySelector("i");
    if (themeIcon) {
      themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    // Update aria-label for accessibility and tooltip
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    const themeColorMeta = document.getElementById("themeColor");
    if (themeColorMeta) {
      themeColorMeta.content = isDark ? "#121212" : "#ffffff";
    }

    // Update logo based on theme
    updateLogoForTheme(isDark);
  }

  function updateLogoForTheme(isDark) {
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
      // Get the base path of the current logo
      const currentSrc = logoImg.src;
      const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('/') + 1);

      if (isDark) {
        // In dark mode, use logo with white background
        logoImg.src = basePath + 'MAISH_LOGO_WHITE_BG.png';
      } else {
        // In light mode, use logo with transparent/no background
        logoImg.src = basePath + 'MAISH_LOGO-1-removebg-preview.png';
      }

      // Add error handling for missing logo files
      logoImg.onerror = function() {
        console.warn('Themed logo file not found, falling back to default logo');
        // Fallback to original logo if the themed version doesn't exist
        this.src = basePath + 'MAISH_LOGO-1-removebg-preview.png';
        // Remove error handler after fallback
        this.onerror = null;
      };
    }
  }

  // Initialize theme on page load
  initializeTheme();

  // Initialize logo on page load
  // Note: You need to provide one additional logo file:
  // - MAISH_LOGO_WHITE_BG.png (logo with white background for dark mode)
  // - MAISH_LOGO-1-removebg-preview.png (already exists - transparent logo for light mode)
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark';
  updateLogoForTheme(isDark);

  // Enhanced theme toggle functionality
  if (themeToggle) {
    console.log("Theme toggle button found:", themeToggle);
    themeToggle.addEventListener("click", () => {
      console.log("Theme toggle clicked");
      console.log("Body classes before toggle:", document.body.className);
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      console.log("Body classes after toggle:", document.body.className);
      console.log("Theme toggled to:", isDark ? 'dark' : 'light');
      console.log("Computed background color:", getComputedStyle(document.body).backgroundColor);
      console.log("Computed text color:", getComputedStyle(document.body).color);
      updateThemeIcon(isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Dispatch custom event for other scripts to listen to theme changes
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { isDark: isDark }
      }));

      // Add visual feedback
      themeToggle.style.transform = 'scale(1.2)';
      setTimeout(() => {
        themeToggle.style.transform = '';
      }, 200);
    });
  } else {
    console.warn("Theme toggle button not found!");
  }

  // Mobile menu functionality
  function toggleMenu() {
    const isOpen = navLinks.classList.contains("active");
    const icon = mobileMenuBtn.querySelector("i");

    if (!isOpen) {
      navLinks.classList.add("active");
      document.body.classList.add("menu-open");
      icon.classList.replace("fa-bars", "fa-times");
      mobileMenuBtn.setAttribute("aria-expanded", "true");
    } else {
      navLinks.classList.remove("active");
      document.body.classList.remove("menu-open");
      icon.classList.replace("fa-times", "fa-bars");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }
  }

  // Close menu function
  function closeMenu() {
    navLinks.classList.remove("active");
    document.body.classList.remove("menu-open");
    const icon = mobileMenuBtn.querySelector("i");
    if (icon) {
      icon.classList.replace("fa-times", "fa-bars");
    }
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  }

  // Toggle menu when button is clicked
  mobileMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking the X button in mobile menu
  navLinks.addEventListener("click", (e) => {
    if (e.target.textContent === "×") {
      e.preventDefault();
      closeMenu();
    }
  });

  // Account functionality
  if (accountBtn) {
    accountBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (accountModal) accountModal.style.display = "flex";
      if (navLinks.classList.contains("active")) {
        toggleMenu(); // Close mobile menu if open
      }
    });
  }

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (accountModal && e.target === accountModal) {
      accountModal.style.display = "none";
    }
    if (navLinks.classList.contains("active") && 
        !navLinks.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
      toggleMenu();
    }
  });

  // Handle navigation link clicks
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      const href = e.target.getAttribute("href");

      // Close the mobile menu if it's open
      if (navLinks.classList.contains("active")) {
        e.preventDefault();
        toggleMenu();
        // Smooth scroll to the section after a small delay
        setTimeout(() => {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = href;
          }
        }, 300);
      } else if (href.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  });

  // Ensure all navigation links are visible in mobile menu
  function ensureMobileMenuVisibility() {
    if (window.innerWidth <= 768) {
      const navItems = navLinks.querySelectorAll('li');
      navItems.forEach(item => {
        item.style.opacity = '1';
        item.style.visibility = 'visible';
        item.style.display = 'block';
      });
    }
  }

  // Call on page load and resize
  ensureMobileMenuVisibility();
  window.addEventListener('resize', ensureMobileMenuVisibility);

  // Close menu and modals when pressing Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (navLinks.classList.contains("active")) {
        closeMenu();
      }
      if (accountModal && accountModal.style.display === "flex") {
        accountModal.style.display = "none";
      }
      if (cartPreview && cartPreview.classList.contains("active")) {
        cartPreview.classList.remove("active");
      }
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("active") &&
        !navLinks.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)) {
      closeMenu();
    }
  });

  const newsletterForm = document.getElementById("newsletterForm");
  const subscribeStatus = document.getElementById("subscribeStatus");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (subscribeStatus) {
        if (emailInput.value) {
          subscribeStatus.textContent = "Thank you for subscribing!";
          emailInput.value = "";
        } else {
          subscribeStatus.textContent = "Please enter a valid email address.";
        }
        setTimeout(() => (subscribeStatus.textContent = ""), 3000);
      }
    });
  }

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener(
      "scroll",
      () => (backToTopBtn.style.display = window.scrollY > 300 ? "flex" : "none")
    );
    backToTopBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  // ========== Call Button Functionality ==========
  // Enhanced call button functionality with fallbacks
  function handleCallButton(event) {
    event.preventDefault();
    const phoneNumber = "+254799921036";

    // Try to open phone dialer
    try {
      window.location.href = `tel:${phoneNumber}`;
    } catch (error) {
      console.warn("tel: protocol failed, trying fallback methods");

      // Fallback 1: Try opening in a new window/tab
      try {
        window.open(`tel:${phoneNumber}`, '_blank');
      } catch (fallbackError) {
        console.warn("Fallback method failed");

        // Fallback 2: Copy number to clipboard and show alert
        if (navigator.clipboard) {
          navigator.clipboard.writeText(phoneNumber).then(() => {
            alert(`Phone number ${phoneNumber} copied to clipboard. Please paste it in your phone dialer.`);
          }).catch(() => {
            alert(`Please call: ${phoneNumber}`);
          });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = phoneNumber;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert(`Phone number ${phoneNumber} copied to clipboard. Please paste it in your phone dialer.`);
        }
      }
    }
  }

  // Attach enhanced call functionality to all call buttons
  const callButtons = document.querySelectorAll('a[href^="tel:"], .fab-call, .btn[href*="tel"], .phone-link');
  callButtons.forEach(button => {
    button.addEventListener('click', handleCallButton);
  });

  // Also handle the specific "Call Maish" button
  const callMaishBtn = document.querySelector('.btn[href*="tel"]');
  if (callMaishBtn) {
    callMaishBtn.addEventListener('click', handleCallButton);
  }

  // Handle floating call button specifically
  const fabCallBtn = document.querySelector('.fab-call');
  if (fabCallBtn) {
    fabCallBtn.addEventListener('click', handleCallButton);
  }

  // ========== Image Magnification Functionality ==========
  // Handle image magnification on mobile devices
  function initializeImageMagnification() {
    const productImages = document.querySelectorAll('.product-img img');

    productImages.forEach(img => {
      // Add touch event listeners for mobile devices
      img.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent default touch behavior
        this.classList.toggle('magnified');

        // Add visual feedback for tap
        this.style.transform += ' scale(0.98)';
        setTimeout(() => {
          this.style.transform = this.style.transform.replace(' scale(0.98)', '');
        }, 100);
      }, { passive: false });

      // Handle double-tap to zoom out on mobile
      let lastTap = 0;
      img.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
          // Double tap detected
          this.classList.remove('magnified');
          e.preventDefault();
        }
        lastTap = currentTime;
      });

      // Prevent image dragging on mobile
      img.addEventListener('dragstart', function(e) {
        e.preventDefault();
      });

      // Add keyboard accessibility for magnification
      img.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.classList.toggle('magnified');
        }
      });

      // Make images focusable for keyboard navigation
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Click or tap to magnify image');
    });

    // Close magnification when clicking outside on mobile
    document.addEventListener('touchstart', function(e) {
      if (!e.target.closest('.product-img')) {
        const magnifiedImages = document.querySelectorAll('.product-img img.magnified');
        magnifiedImages.forEach(img => {
          img.classList.remove('magnified');
        });
      }
    });

    // Add CSS for better mobile experience
    const style = document.createElement('style');
    style.textContent = `
      .product-img img:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }

      .product-img img.magnified {
        z-index: 10;
        position: relative;
      }

      @media (max-width: 768px) {
        .product-img img {
          transition: transform 0.2s ease;
        }

        .product-img img.magnified {
          transform: scale(1.3) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize image magnification
  initializeImageMagnification();

  // ========== Footer Links Functionality ==========
  const shippingPolicyLink = document.getElementById('shippingPolicy');
  const returnPolicyLink = document.getElementById('returnPolicy');
  const sizeGuideLink = document.getElementById('sizeGuide');
  const paymentMethodsLink = document.getElementById('paymentMethods');
  const trackOrderLink = document.getElementById('trackOrder');

  if (shippingPolicyLink) {
    shippingPolicyLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('100% trust and guaranteed. Deliveries are done countrywide on time and done during working days from monday to saturday.');
    });
  }

  if (returnPolicyLink) {
    returnPolicyLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('The order only returns within 72hrs and on delivery call. Kindly Note that inner wears are not returned due to hygiene purposes.');
    });
  }

  if (sizeGuideLink) {
    sizeGuideLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Available sizes: XS, SMALL, MEDIUM, LARGE, XL, XXL. For more info about the sizes and colours contact us on WhatsApp Using the Emergency number we have our Agent Online Marketer who will assist you with your order.');
    });
  }

  if (paymentMethodsLink) {
    paymentMethodsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showCheckoutModal();
    });
  }

  if (trackOrderLink) {
    trackOrderLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Your order will be on its way or just reach us and confirm your order directly from the customer service Agent. Thank you for choosing Maish Boutique.');
    });
  }
// ========== Draggable AI Chat Widget ==========
const tidioChat = document.getElementById('tidio-chat');
if (tidioChat) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  tidioChat.style.position = 'fixed';
  tidioChat.style.cursor = 'move';
  tidioChat.style.userSelect = 'none';
  tidioChat.style.zIndex = '10000';

  tidioChat.addEventListener('mousedown', dragStart);

  function dragStart(e) {
    if (e.target.closest('#tidio-chat-iframe')) return; // Don't drag if clicking inside iframe
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === tidioChat || tidioChat.contains(e.target)) {
      isDragging = true;
      tidioChat.classList.add('dragging');
    }
  }

  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      tidioChat.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    tidioChat.classList.remove('dragging');
  }

  // Touch support for mobile
  tidioChat.addEventListener('touchstart', dragStartTouch, { passive: false });

  function dragStartTouch(e) {
    if (e.target.closest('#tidio-chat-iframe')) return;
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;

    if (e.target === tidioChat || tidioChat.contains(e.target)) {
      isDragging = true;
      tidioChat.classList.add('dragging');
      e.preventDefault();
    }
  }

  document.addEventListener('touchmove', dragTouch, { passive: false });
  document.addEventListener('touchend', dragEndTouch);

  function dragTouch(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      tidioChat.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  }

  function dragEndTouch(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    tidioChat.classList.remove('dragging');
  }
}
});

// Wait for Tidio chat to load before making it draggable
function initDraggableTidio() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.id === 'tidio-chat' || node.querySelector('#tidio-chat'))) {
            const tidioChat = document.getElementById('tidio-chat');
            if (tidioChat && !tidioChat.dataset.draggableInit) {
              tidioChat.dataset.draggableInit = 'true';
              // Re-attach drag handlers here or call the drag init function
              let isDragging = false;
              let currentX = 0;
              let currentY = 0;
              let initialX;
              let initialY;
              let xOffset = 0;
              let yOffset = 0;

              tidioChat.style.position = 'fixed';
              tidioChat.style.cursor = 'move';
              tidioChat.style.userSelect = 'none';
              tidioChat.style.zIndex = '10000';

              tidioChat.addEventListener('mousedown', dragStart);

              function dragStart(e) {
                if (e.target.closest('#tidio-chat-iframe')) return;
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === tidioChat || tidioChat.contains(e.target)) {
                  isDragging = true;
                  tidioChat.classList.add('dragging');
                }
              }

              document.addEventListener('mousemove', drag);
              document.addEventListener('mouseup', dragEnd);

              function drag(e) {
                if (isDragging) {
                  e.preventDefault();
                  currentX = e.clientX - initialX;
                  currentY = e.clientY - initialY;

                  xOffset = currentX;
                  yOffset = currentY;

                  tidioChat.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
              }

              function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                tidioChat.classList.remove('dragging');
              }

              // Touch support
              tidioChat.addEventListener('touchstart', dragStartTouch, { passive: false });

              function dragStartTouch(e) {
                if (e.target.closest('#tidio-chat-iframe')) return;
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;

                if (e.target === tidioChat || tidioChat.contains(e.target)) {
                  isDragging = true;
                  tidioChat.classList.add('dragging');
                  e.preventDefault();
                }
              }

              document.addEventListener('touchmove', dragTouch, { passive: false });
              document.addEventListener('touchend', dragEndTouch);

              function dragTouch(e) {
                if (isDragging) {
                  e.preventDefault();
                  currentX = e.touches[0].clientX - initialX;
                  currentY = e.touches[0].clientY - initialY;

                  xOffset = currentX;
                  yOffset = currentY;

                  tidioChat.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
              }

              function dragEndTouch(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                tidioChat.classList.remove('dragging');
              }

              observer.disconnect(); // Stop observing once initialized
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Start observing after DOM loads
document.addEventListener('DOMContentLoaded', initDraggableTidio);

// Fallback: Check every 2 seconds for up to 30 seconds if Tidio loads late
let checkInterval = setInterval(() => {
  const tidioChat = document.getElementById('tidio-chat');
  if (tidioChat && !tidioChat.dataset.draggableInit) {
    clearInterval(checkInterval);
    initDraggableTidio();
  }
}, 2000);

setTimeout(() => clearInterval(checkInterval), 30000);
