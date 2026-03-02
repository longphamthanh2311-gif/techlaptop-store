// ============================================================
// ADMIN.JS – Admin Panel Logic
// ============================================================

(function () {
  "use strict";

  // ── State ────────────────────────────────────────────────
  let products = [];
  let orders = [];
  let editingId = null;
  let deleteTargetId = null;
  let adminSearch = "";
  let adminFilter = "all";
  let currentPage = "dashboard";

  const GRADIENTS = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #0076CE 0%, #00449E 100%)",
    "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
    "linear-gradient(135deg, #434343 0%, #000000 100%)",
    "linear-gradient(135deg, #DA22FF 0%, #9733EE 100%)",
    "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
    "linear-gradient(135deg, #1428A0 0%, #3d5af1 100%)",
    "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)",
    "linear-gradient(135deg, #134E5E 0%, #71B280 100%)",
  ];

  let selectedGradient = GRADIENTS[0];

  // ── Init ─────────────────────────────────────────────────
  function init() {
    products = loadProducts();
    orders = loadOrders();
    renderStats();
    renderDashboardProducts();
    renderProductsTable();
    renderOrdersTable();
    setupEventListeners();
    navigateTo("dashboard");
  }

  // ── Navigation ────────────────────────────────────────────
  function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    const target = document.getElementById("page-" + page);
    if (target) target.classList.add("active");

    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === page);
    });

    // Update topbar title
    const titles = {
      dashboard: { title: "Dashboard", sub: "Tổng quan hệ thống" },
      products: { title: "Quản Lý Sản Phẩm", sub: "Thêm, sửa, xóa laptop" },
      orders: { title: "Quản Lý Đơn Hàng", sub: "Theo dõi đơn hàng của khách" },
    };
    const t = titles[page] || titles.dashboard;
    document.getElementById("topbarTitle").textContent = t.title;
    document.getElementById("topbarSub").textContent = t.sub;
  }

  // ── Event Listeners ───────────────────────────────────────
  function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.addEventListener("click", () => navigateTo(link.dataset.page));
    });

    // Add product button
    document.getElementById("addProductBtn").addEventListener("click", () => openProductModal());

    // Product modal close
    document.getElementById("productModalClose").addEventListener("click", closeProductModal);
    document.getElementById("productModalOverlay").addEventListener("click", function (e) {
      if (e.target === this) closeProductModal();
    });
    document.getElementById("cancelProductBtn").addEventListener("click", closeProductModal);

    // Product form submit
    document.getElementById("productForm").addEventListener("submit", saveProduct);

    // Delete confirm modal
    document.getElementById("deleteModalClose").addEventListener("click", closeDeleteModal);
    document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteModal);
    document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDelete);

    // Admin search
    document.getElementById("adminSearch").addEventListener("input", debounce(function () {
      adminSearch = this.value.trim().toLowerCase();
      renderProductsTable();
    }, 250));

    // Admin category filter
    document.getElementById("adminCategoryFilter").addEventListener("change", function () {
      adminFilter = this.value;
      renderProductsTable();
    });

    // Gradient chips
    renderGradientChips();

    // View store link
    document.getElementById("viewStoreBtn").addEventListener("click", () => {
      window.open("index.html", "_blank");
    });
  }

  // ── Stats ─────────────────────────────────────────────────
  function renderStats() {
    products = loadProducts();
    orders = loadOrders();

    const totalProducts = products.length;
    const totalStock = products.reduce((a, p) => a + p.stock, 0);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((a, o) => a + (o.total || 0), 0);
    const outOfStock = products.filter((p) => p.stock === 0).length;

    document.getElementById("statProducts").textContent = totalProducts;
    document.getElementById("statStock").textContent = totalStock;
    document.getElementById("statOrders").textContent = totalOrders;
    document.getElementById("statRevenue").textContent = formatPrice(totalRevenue);
    document.getElementById("statOutOfStock").textContent = outOfStock;
  }

  // ── Dashboard Products ────────────────────────────────────
  function renderDashboardProducts() {
    products = loadProducts();
    const grid = document.getElementById("dashboardProducts");
    const recent = [...products].slice(0, 8);
    grid.innerHTML = recent.map((p) => `
      <div class="mini-product-card">
        <div class="mini-product-thumb" style="background:${p.gradient}">💻</div>
        <div class="mini-product-info">
          <div class="mini-product-name">${p.name}</div>
          <div class="mini-product-price">${formatPrice(p.price)}</div>
        </div>
      </div>`).join("");
  }

  // ── Products Table ────────────────────────────────────────
  function renderProductsTable() {
    products = loadProducts();
    let filtered = [...products];

    if (adminSearch) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(adminSearch) ||
        p.brand.toLowerCase().includes(adminSearch)
      );
    }
    if (adminFilter !== "all") {
      filtered = filtered.filter((p) => p.category === adminFilter);
    }

    const tbody = document.getElementById("productsTableBody");

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3>Không có sản phẩm</h3>
          <p>Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((p) => {
      const discount = discountPercent(p.originalPrice, p.price);
      const stockBadge = p.stock === 0
        ? `<span class="badge badge-danger">Hết hàng</span>`
        : p.stock < 5
        ? `<span class="badge badge-warning">${p.stock} còn lại</span>`
        : `<span class="badge badge-success">${p.stock} cái</span>`;

      const catLabel = CATEGORIES[p.category] || p.category;

      return `<tr>
        <td>
          <div class="tbl-product-cell">
            <div class="tbl-thumb" style="background:${p.gradient}">💻</div>
            <div>
              <div class="tbl-product-name">${p.name}</div>
              <div class="tbl-product-brand">${p.brand}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-gray">${catLabel}</span></td>
        <td>
          <div style="font-weight:700;color:#ef4444">${formatPrice(p.price)}</div>
          ${discount > 0 ? `<div style="font-size:12px;color:#64748b;text-decoration:line-through">${formatPrice(p.originalPrice)}</div>` : ""}
        </td>
        <td>${stockBadge}</td>
        <td>
          <div style="display:flex;align-items:center;gap:4px">
            <span style="color:#f59e0b">${"★".repeat(Math.round(p.rating))}</span>
            <span style="font-size:13px;color:#64748b">${p.rating}</span>
          </div>
        </td>
        <td>
          ${p.featured
            ? `<span class="badge badge-primary">✓ Nổi bật</span>`
            : `<span class="badge badge-gray">Thường</span>`}
        </td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-outline btn-sm btn-icon edit-btn" data-id="${p.id}" title="Sửa">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon delete-btn" data-id="${p.id}" title="Xóa">🗑</button>
          </div>
        </td>
      </tr>`;
    }).join("");

    // Attach row button events
    tbody.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openProductModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => openDeleteModal(parseInt(btn.dataset.id)));
    });
  }

  // ── Orders Table ──────────────────────────────────────────
  function renderOrdersTable() {
    orders = loadOrders();
    const tbody = document.getElementById("ordersTableBody");

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>Chưa có đơn hàng</h3>
          <p>Đơn hàng từ khách sẽ xuất hiện ở đây</p>
        </div>
      </td></tr>`;
      return;
    }

    const statusMap = {
      pending:   { label: "Chờ xử lý",   badge: "badge-warning" },
      confirmed: { label: "Đã xác nhận", badge: "badge-primary" },
      shipping:  { label: "Đang giao",   badge: "badge-info" },
      delivered: { label: "Đã giao",     badge: "badge-success" },
      cancelled: { label: "Đã hủy",      badge: "badge-danger" },
    };

    tbody.innerHTML = orders.map((o) => {
      const st = statusMap[o.status] || statusMap.pending;
      const date = new Date(o.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      const itemsText = o.items.map((i) => `${i.name} x${i.qty}`).join(", ");
      return `<tr>
        <td style="font-weight:700;color:#2563eb">${o.code}</td>
        <td>
          <div style="font-weight:600">${o.name}</div>
          <div style="font-size:12px;color:#64748b">${o.phone}</div>
        </td>
        <td style="font-size:12px;color:#64748b;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${itemsText}">${itemsText}</td>
        <td style="font-weight:700;color:#ef4444">${formatPrice(o.total)}</td>
        <td><span class="badge ${st.badge}">${st.label}</span></td>
        <td>
          <div style="font-size:12px;color:#64748b">${date}</div>
          <select class="filter-select" style="font-size:12px;padding:4px 8px;margin-top:4px" onchange="window.adminUpdateOrderStatus(${o.id}, this.value)">
            ${Object.entries(statusMap).map(([k, v]) => `<option value="${k}" ${o.status === k ? "selected" : ""}>${v.label}</option>`).join("")}
          </select>
        </td>
      </tr>`;
    }).join("");
  }

  // Expose order status update globally
  window.adminUpdateOrderStatus = function (id, status) {
    orders = loadOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      localStorage.setItem("tl_orders", JSON.stringify(orders));
      showToast("Cập nhật trạng thái đơn hàng thành công!", "success");
    }
  };

  // ── Product Modal ─────────────────────────────────────────
  function openProductModal(id) {
    editingId = id || null;
    const modal = document.getElementById("productModalOverlay");
    const form = document.getElementById("productForm");
    form.reset();
    selectedGradient = GRADIENTS[0];
    updateGradientPreview();

    const title = document.getElementById("productModalTitle");

    if (id) {
      products = loadProducts();
      const p = products.find((pr) => pr.id === id);
      if (!p) return;
      title.textContent = "Sửa Sản Phẩm";
      form.querySelector("#fName").value = p.name;
      form.querySelector("#fBrand").value = p.brand;
      form.querySelector("#fCategory").value = p.category;
      form.querySelector("#fPrice").value = p.price;
      form.querySelector("#fOriginalPrice").value = p.originalPrice;
      form.querySelector("#fCpu").value = p.cpu;
      form.querySelector("#fRam").value = p.ram;
      form.querySelector("#fStorage").value = p.storage;
      form.querySelector("#fDisplay").value = p.display;
      form.querySelector("#fBattery").value = p.battery;
      form.querySelector("#fWeight").value = p.weight;
      form.querySelector("#fStock").value = p.stock;
      form.querySelector("#fRating").value = p.rating;
      form.querySelector("#fFeatured").checked = p.featured;
      form.querySelector("#fDescription").value = p.description;
      selectedGradient = p.gradient || GRADIENTS[0];
      updateGradientPreview();

      // Update selected chip
      document.querySelectorAll(".gradient-chip").forEach((chip) => {
        chip.classList.toggle("selected", chip.dataset.gradient === selectedGradient);
      });
    } else {
      title.textContent = "Thêm Sản Phẩm Mới";
      document.querySelectorAll(".gradient-chip")[0]?.classList.add("selected");
    }

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    document.getElementById("productModalOverlay").classList.remove("open");
    document.body.style.overflow = "";
    editingId = null;
  }

  function saveProduct(e) {
    e.preventDefault();
    const form = e.target;

    const data = {
      name: form.querySelector("#fName").value.trim(),
      brand: form.querySelector("#fBrand").value.trim(),
      category: form.querySelector("#fCategory").value,
      price: parseInt(form.querySelector("#fPrice").value) || 0,
      originalPrice: parseInt(form.querySelector("#fOriginalPrice").value) || 0,
      cpu: form.querySelector("#fCpu").value.trim(),
      ram: form.querySelector("#fRam").value.trim(),
      storage: form.querySelector("#fStorage").value.trim(),
      display: form.querySelector("#fDisplay").value.trim(),
      battery: form.querySelector("#fBattery").value.trim(),
      weight: form.querySelector("#fWeight").value.trim(),
      stock: parseInt(form.querySelector("#fStock").value) || 0,
      rating: parseFloat(form.querySelector("#fRating").value) || 4.5,
      featured: form.querySelector("#fFeatured").checked,
      description: form.querySelector("#fDescription").value.trim(),
      gradient: selectedGradient,
    };

    if (!data.name || !data.brand || data.price <= 0) {
      showToast("Vui lòng điền đủ thông tin bắt buộc!", "error");
      return;
    }

    products = loadProducts();

    if (editingId) {
      const idx = products.findIndex((p) => p.id === editingId);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...data };
        showToast("Cập nhật sản phẩm thành công!", "success");
      }
    } else {
      const newProduct = {
        id: generateId(),
        reviews: 0,
        ...data,
      };
      products.push(newProduct);
      showToast("Thêm sản phẩm mới thành công!", "success");
    }

    saveProducts(products);
    closeProductModal();
    renderStats();
    renderDashboardProducts();
    renderProductsTable();
  }

  // ── Delete Modal ──────────────────────────────────────────
  function openDeleteModal(id) {
    deleteTargetId = id;
    const p = products.find((pr) => pr.id === id);
    if (!p) return;
    document.getElementById("deleteProductName").textContent = p.name;
    document.getElementById("deleteModalOverlay").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDeleteModal() {
    document.getElementById("deleteModalOverlay").classList.remove("open");
    document.body.style.overflow = "";
    deleteTargetId = null;
  }

  function confirmDelete() {
    if (!deleteTargetId) return;
    products = loadProducts();
    products = products.filter((p) => p.id !== deleteTargetId);
    saveProducts(products);
    closeDeleteModal();
    renderStats();
    renderDashboardProducts();
    renderProductsTable();
    showToast("Đã xóa sản phẩm!", "success");
  }

  // ── Gradient Chips ────────────────────────────────────────
  function renderGradientChips() {
    const container = document.getElementById("gradientChips");
    container.innerHTML = GRADIENTS.map((g, i) => `
      <div class="gradient-chip ${i === 0 ? "selected" : ""}"
           style="background:${g}"
           data-gradient="${g}"
           title="Màu ${i + 1}"></div>`).join("");

    container.querySelectorAll(".gradient-chip").forEach((chip) => {
      chip.addEventListener("click", function () {
        container.querySelectorAll(".gradient-chip").forEach((c) => c.classList.remove("selected"));
        this.classList.add("selected");
        selectedGradient = this.dataset.gradient;
        updateGradientPreview();
      });
    });
  }

  function updateGradientPreview() {
    const preview = document.getElementById("gradientPreview");
    if (preview) {
      preview.style.background = selectedGradient;
    }
  }

  // ── Toast ─────────────────────────────────────────────────
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
    }, 3200);
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
