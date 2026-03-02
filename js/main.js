// ============================================================
// MAIN.JS – Customer Website Logic
// ============================================================

(function () {
  "use strict";

  // ── State ────────────────────────────────────────────────
  let products = [];
  let cart = [];
  let currentFilter = "tat-ca";
  let currentSort = "default";
  let currentSearch = "";
  let modalProductId = null;
  let modalQty = 1;

  // ── Init ─────────────────────────────────────────────────
  function init() {
    products = loadProducts();
    cart = loadCart();
    renderProducts();
    renderCart();
    updateCartBadge();
    setupEventListeners();
  }

  // ── Event Listeners ───────────────────────────────────────
  function setupEventListeners() {
    // Search
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", debounce(function () {
        currentSearch = this.value.trim().toLowerCase();
        renderProducts();
      }, 300));
    }

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        currentFilter = this.dataset.filter;
        renderProducts();
      });
    });

    // Sort
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        currentSort = this.value;
        renderProducts();
      });
    }

    // Cart button open
    document.getElementById("cartBtn").addEventListener("click", openCart);

    // Cart overlay close
    document.getElementById("cartOverlay").addEventListener("click", closeCart);

    // Cart close button
    document.getElementById("cartClose").addEventListener("click", closeCart);

    // Cart checkout button
    document.getElementById("checkoutBtn").addEventListener("click", openCheckout);

    // Product modal close
    document.getElementById("productModalOverlay").addEventListener("click", function (e) {
      if (e.target === this) closeProductModal();
    });
    document.getElementById("productModalClose").addEventListener("click", closeProductModal);

    // Checkout modal close
    document.getElementById("checkoutOverlay").addEventListener("click", function (e) {
      if (e.target === this) closeCheckout();
    });
    document.getElementById("checkoutClose").addEventListener("click", closeCheckout);

    // Checkout form submit
    document.getElementById("checkoutForm").addEventListener("submit", submitOrder);

    // Qty buttons in product modal
    document.getElementById("qtyMinus").addEventListener("click", function () {
      if (modalQty > 1) {
        modalQty--;
        document.getElementById("qtyInput").value = modalQty;
      }
    });
    document.getElementById("qtyPlus").addEventListener("click", function () {
      const product = products.find((p) => p.id === modalProductId);
      if (product && modalQty < product.stock) {
        modalQty++;
        document.getElementById("qtyInput").value = modalQty;
      }
    });
    document.getElementById("qtyInput").addEventListener("change", function () {
      const product = products.find((p) => p.id === modalProductId);
      let val = parseInt(this.value) || 1;
      if (val < 1) val = 1;
      if (product && val > product.stock) val = product.stock;
      modalQty = val;
      this.value = val;
    });

    // Add to cart from modal
    document.getElementById("modalAddToCart").addEventListener("click", function () {
      const product = products.find((p) => p.id === modalProductId);
      if (product) {
        addToCart(product, modalQty);
        closeProductModal();
      }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const id = this.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Header scroll effect
    window.addEventListener("scroll", function () {
      const header = document.getElementById("header");
      if (window.scrollY > 40) {
        header.style.background = "rgba(15,23,42,0.98)";
      } else {
        header.style.background = "rgba(15,23,42,0.92)";
      }
    });
  }

  // ── Render Products ───────────────────────────────────────
  function renderProducts() {
    let filtered = [...products];

    // Filter by category
    if (currentFilter !== "tat-ca") {
      filtered = filtered.filter((p) => p.category === currentFilter);
    }

    // Filter by search
    if (currentSearch) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(currentSearch) ||
          p.brand.toLowerCase().includes(currentSearch) ||
          p.cpu.toLowerCase().includes(currentSearch)
      );
    }

    // Sort
    switch (currentSort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Featured first
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    const grid = document.getElementById("productsGrid");
    const count = document.getElementById("productsCount");
    if (count) count.textContent = `${filtered.length} sản phẩm`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Không tìm thấy sản phẩm</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map((p) => productCardHTML(p)).join("");

    // Attach card click events
    grid.querySelectorAll(".product-card").forEach((card) => {
      const id = parseInt(card.dataset.id);
      card.addEventListener("click", function (e) {
        if (e.target.closest(".add-cart-btn")) return;
        openProductModal(id);
      });
      const addBtn = card.querySelector(".add-cart-btn");
      if (addBtn) {
        addBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          const product = products.find((p) => p.id === id);
          if (product) addToCart(product, 1);
        });
      }
    });
  }

  function productCardHTML(p) {
    const discount = discountPercent(p.originalPrice, p.price);
    const outOfStock = p.stock <= 0;
    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-image" style="background:${p.gradient}">
          <div class="product-image-inner">💻</div>
          ${discount > 0 ? `<span class="badge-discount">-${discount}%</span>` : ""}
          ${p.featured && !outOfStock ? `<span class="badge-hot">HOT</span>` : ""}
          ${outOfStock ? `<div class="badge-out">Hết hàng</div>` : ""}
        </div>
        <div class="product-body">
          <div class="product-brand">${p.brand}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-specs">
            <span class="spec-tag">${p.cpu.split(" ").slice(0, 3).join(" ")}</span>
            <span class="spec-tag">${p.ram}</span>
            <span class="spec-tag">${p.storage}</span>
          </div>
          <div class="product-rating">
            <span class="stars">${starsHTML(p.rating)}</span>
            <span>${p.rating} (${p.reviews})</span>
          </div>
        </div>
        <div class="product-footer">
          <div class="price-group">
            <span class="price-current">${formatPrice(p.price)}</span>
            ${p.originalPrice > p.price ? `<span class="price-original">${formatPrice(p.originalPrice)}</span>` : ""}
          </div>
          <button class="add-cart-btn" ${outOfStock ? "disabled" : ""}>
            🛒 Thêm
          </button>
        </div>
      </div>`;
  }

  // ── Product Modal ─────────────────────────────────────────
  function openProductModal(id) {
    const p = products.find((pr) => pr.id === id);
    if (!p) return;
    modalProductId = id;
    modalQty = 1;

    document.getElementById("qtyInput").value = 1;
    document.getElementById("productModalHeader").style.background = p.gradient;
    document.getElementById("modalBrand").textContent = p.brand;
    document.getElementById("modalName").textContent = p.name;
    document.getElementById("modalDesc").textContent = p.description;
    document.getElementById("modalRating").innerHTML = `
      <span class="stars">${starsHTML(p.rating)}</span>
      <span>${p.rating} / 5 &nbsp;·&nbsp; ${p.reviews} đánh giá</span>`;
    document.getElementById("modalSpecs").innerHTML = `
      <div class="spec-row"><div class="spec-label">CPU</div><div class="spec-value">${p.cpu}</div></div>
      <div class="spec-row"><div class="spec-label">RAM</div><div class="spec-value">${p.ram}</div></div>
      <div class="spec-row"><div class="spec-label">Lưu Trữ</div><div class="spec-value">${p.storage}</div></div>
      <div class="spec-row"><div class="spec-label">Màn Hình</div><div class="spec-value">${p.display}</div></div>
      <div class="spec-row"><div class="spec-label">Pin</div><div class="spec-value">${p.battery}</div></div>
      <div class="spec-row"><div class="spec-label">Cân Nặng</div><div class="spec-value">${p.weight}</div></div>`;

    const discount = discountPercent(p.originalPrice, p.price);
    const save = p.originalPrice - p.price;
    document.getElementById("modalPriceBlock").innerHTML = `
      <div class="modal-price-current">${formatPrice(p.price)}</div>
      ${p.originalPrice > p.price ? `
        <div class="modal-price-original">${formatPrice(p.originalPrice)}</div>
        <div class="modal-price-save">Tiết kiệm ${formatPrice(save)} (${discount}%)</div>` : ""}`;

    const addBtn = document.getElementById("modalAddToCart");
    if (p.stock <= 0) {
      addBtn.disabled = true;
      addBtn.textContent = "Hết hàng";
    } else {
      addBtn.disabled = false;
      addBtn.textContent = "🛒 Thêm vào giỏ";
    }

    document.getElementById("productModalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    document.getElementById("productModalOverlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  // ── Cart ──────────────────────────────────────────────────
  function addToCart(product, qty) {
    if (product.stock <= 0) return;
    const existing = cart.find((i) => i.id === product.id);
    if (existing) {
      const newQty = existing.qty + qty;
      existing.qty = Math.min(newQty, product.stock);
    } else {
      cart.push({ id: product.id, qty: Math.min(qty, product.stock) });
    }
    saveCart(cart);
    renderCart();
    updateCartBadge();
    showToast("✓ Đã thêm vào giỏ hàng!", "success");
  }

  function removeFromCart(id) {
    cart = cart.filter((i) => i.id !== id);
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function updateQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const product = products.find((p) => p.id === id);
    const maxQty = product ? product.stock : 99;
    item.qty = Math.max(1, Math.min(item.qty + delta, maxQty));
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    const total = cart.reduce((acc, i) => acc + i.qty, 0);
    badge.textContent = total;
    badge.classList.toggle("visible", total > 0);
  }

  function renderCart() {
    const container = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Giỏ hàng trống</p>
          <p style="font-size:13px">Hãy thêm sản phẩm vào giỏ!</p>
        </div>`;
      totalEl.textContent = "0 ₫";
      return;
    }

    let total = 0;
    const html = cart.map((item) => {
      const p = products.find((pr) => pr.id === item.id);
      if (!p) return "";
      const subtotal = p.price * item.qty;
      total += subtotal;
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-thumb" style="background:${p.gradient}">💻</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">${formatPrice(p.price)}</div>
            <div class="cart-item-actions">
              <div class="qty-mini">
                <button class="qty-mini-btn qty-down" data-id="${p.id}">−</button>
                <span class="qty-mini-num">${item.qty}</span>
                <button class="qty-mini-btn qty-up" data-id="${p.id}">+</button>
              </div>
              <button class="cart-remove-btn" data-id="${p.id}">🗑</button>
            </div>
          </div>
        </div>`;
    }).join("");

    container.innerHTML = html;
    totalEl.textContent = formatPrice(total);

    // Attach cart item events
    container.querySelectorAll(".qty-down").forEach((btn) => {
      btn.addEventListener("click", () => updateQty(parseInt(btn.dataset.id), -1));
    });
    container.querySelectorAll(".qty-up").forEach((btn) => {
      btn.addEventListener("click", () => updateQty(parseInt(btn.dataset.id), +1));
    });
    container.querySelectorAll(".cart-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(parseInt(btn.dataset.id)));
    });
  }

  function openCart() {
    document.getElementById("cartSidebar").classList.add("open");
    document.getElementById("cartOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  // ── Checkout ──────────────────────────────────────────────
  function openCheckout() {
    if (cart.length === 0) {
      showToast("Giỏ hàng đang trống!", "error");
      return;
    }
    closeCart();

    // Build summary
    let total = 0;
    const rows = cart.map((item) => {
      const p = products.find((pr) => pr.id === item.id);
      if (!p) return "";
      const subtotal = p.price * item.qty;
      total += subtotal;
      return `<div class="checkout-item-row">
        <span>${p.name} x${item.qty}</span>
        <span class="price">${formatPrice(subtotal)}</span>
      </div>`;
    }).join("");

    document.getElementById("checkoutSummaryBody").innerHTML = rows;
    document.getElementById("checkoutTotal").textContent = formatPrice(total);
    document.getElementById("checkoutFormWrapper").style.display = "block";
    document.getElementById("checkoutSuccessScreen").style.display = "none";

    document.getElementById("checkoutOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    document.getElementById("checkoutOverlay").classList.remove("open");
    document.body.style.overflow = "";
  }

  function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector("#orderName").value.trim();
    const phone = form.querySelector("#orderPhone").value.trim();
    const address = form.querySelector("#orderAddress").value.trim();
    const note = form.querySelector("#orderNote").value.trim();

    const items = cart.map((item) => {
      const p = products.find((pr) => pr.id === item.id);
      return { id: item.id, name: p ? p.name : "?", qty: item.qty, price: p ? p.price : 0 };
    });

    const total = items.reduce((acc, i) => acc + i.qty * i.price, 0);

    const order = {
      id: generateId(),
      code: "DH" + Date.now().toString().slice(-6),
      name, phone, address, note,
      items,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);

    // Clear cart
    cart = [];
    saveCart(cart);
    renderCart();
    updateCartBadge();

    // Show success
    document.getElementById("checkoutFormWrapper").style.display = "none";
    document.getElementById("checkoutSuccessScreen").style.display = "block";
    document.getElementById("orderCode").textContent = order.code;

    form.reset();
  }

  // ── Helpers ───────────────────────────────────────────────
  function starsHTML(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let s = "★".repeat(full);
    if (half) s += "½";
    s += "☆".repeat(5 - full - (half ? 1 : 0));
    return s;
  }

  function showToast(msg, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity .3s";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ── Start ─────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", init);
})();
