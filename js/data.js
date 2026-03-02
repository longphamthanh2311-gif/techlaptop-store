// ============================================================
// DATA.JS - Product data & localStorage management
// ============================================================

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'MacBook Pro 16" M3 Pro',
    brand: "Apple",
    category: "do-hoa",
    price: 62990000,
    originalPrice: 69990000,
    cpu: "Apple M3 Pro 12-core",
    ram: "18GB Unified Memory",
    storage: "512GB SSD",
    display: '16.2" Liquid Retina XDR',
    battery: "22 giờ",
    weight: "2.14 kg",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    stock: 15,
    featured: true,
    rating: 4.9,
    reviews: 128,
    description:
      "MacBook Pro M3 Pro mang đến hiệu suất vượt trội với chip M3 Pro. Màn hình Liquid Retina XDR tuyệt đẹp, pin siêu bền 22 giờ. Lựa chọn hoàn hảo cho các chuyên gia sáng tạo.",
  },
  {
    id: 2,
    name: "MacBook Air 15 M3",
    brand: "Apple",
    category: "van-phong",
    price: 32990000,
    originalPrice: 35990000,
    cpu: "Apple M3 8-core",
    ram: "8GB Unified Memory",
    storage: "256GB SSD",
    display: '15.3" Liquid Retina',
    battery: "18 giờ",
    weight: "1.51 kg",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    stock: 20,
    featured: true,
    rating: 4.8,
    reviews: 256,
    description:
      "MacBook Air M3 mỏng nhẹ, hiệu suất cao với chip M3. Thiết kế không quạt, siêu yên tĩnh. Phù hợp cho sinh viên và dân văn phòng.",
  },
  {
    id: 3,
    name: "Dell XPS 15 9530",
    brand: "Dell",
    category: "do-hoa",
    price: 45990000,
    originalPrice: 52990000,
    cpu: "Intel Core i7-13700H",
    ram: "16GB DDR5",
    storage: "512GB SSD",
    display: '15.6" OLED Touch',
    battery: "13 giờ",
    weight: "1.86 kg",
    gradient: "linear-gradient(135deg, #0076CE 0%, #00449E 100%)",
    stock: 10,
    featured: true,
    rating: 4.7,
    reviews: 89,
    description:
      "Dell XPS 15 với màn hình OLED 3.5K tuyệt đẹp, hiệu suất Intel Core i7 mạnh mẽ. Thiết kế premium, hoàn hảo cho công việc sáng tạo và giải trí.",
  },
  {
    id: 4,
    name: "ASUS ROG Strix G16",
    brand: "ASUS",
    category: "gaming",
    price: 38990000,
    originalPrice: 42990000,
    cpu: "Intel Core i9-13980HX",
    ram: "16GB DDR5",
    storage: "1TB SSD",
    display: '16" QHD 240Hz',
    battery: "9 giờ",
    weight: "2.5 kg",
    gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
    stock: 8,
    featured: true,
    rating: 4.8,
    reviews: 174,
    description:
      "ASUS ROG Strix G16 - chiến binh gaming đích thực với i9-13980HX và RTX 4080. Màn hình QHD 240Hz mượt mà, tản nhiệt tiên tiến.",
  },
  {
    id: 5,
    name: "Lenovo ThinkPad X1 Carbon",
    brand: "Lenovo",
    category: "van-phong",
    price: 42990000,
    originalPrice: 48990000,
    cpu: "Intel Core i7-1365U",
    ram: "16GB LPDDR5",
    storage: "512GB SSD",
    display: '14" IPS 2.8K',
    battery: "15 giờ",
    weight: "1.12 kg",
    gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)",
    stock: 12,
    featured: false,
    rating: 4.7,
    reviews: 203,
    description:
      "ThinkPad X1 Carbon - huyền thoại laptop doanh nhân. Siêu nhẹ chỉ 1.12kg, bền bỉ với chuẩn MIL-SPEC, bàn phím tuyệt vời nhất phân khúc.",
  },
  {
    id: 6,
    name: "HP Spectre x360 14",
    brand: "HP",
    category: "van-phong",
    price: 36990000,
    originalPrice: 41990000,
    cpu: "Intel Core Ultra 7",
    ram: "16GB LPDDR5",
    storage: "1TB SSD",
    display: '14" OLED 2.8K Touch',
    battery: "17 giờ",
    weight: "1.42 kg",
    gradient: "linear-gradient(135deg, #DA22FF 0%, #9733EE 100%)",
    stock: 6,
    featured: false,
    rating: 4.6,
    reviews: 67,
    description:
      "HP Spectre x360 14 - laptop 2-in-1 cao cấp với màn hình OLED 2.8K cảm ứng, xoay 360°. Thiết kế sang trọng, hiệu suất AI với Core Ultra 7.",
  },
  {
    id: 7,
    name: "MSI Titan GT77 HX",
    brand: "MSI",
    category: "gaming",
    price: 79990000,
    originalPrice: 89990000,
    cpu: "Intel Core i9-13980HX",
    ram: "64GB DDR5",
    storage: "2TB SSD",
    display: '17.3" IPS Mini LED 4K 144Hz',
    battery: "8 giờ",
    weight: "3.3 kg",
    gradient: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
    stock: 4,
    featured: false,
    rating: 4.9,
    reviews: 42,
    description:
      "MSI Titan GT77 HX - quái vật gaming desktop replacement. RTX 4090, màn hình 4K Mini LED 144Hz. Hiệu suất không giới hạn cho game thủ đỉnh cao.",
  },
  {
    id: 8,
    name: "Acer Swift Go 14",
    brand: "Acer",
    category: "van-phong",
    price: 22990000,
    originalPrice: 25990000,
    cpu: "AMD Ryzen 7 7840U",
    ram: "16GB LPDDR5",
    storage: "512GB SSD",
    display: '14" OLED 2.8K 90Hz',
    battery: "10 giờ",
    weight: "1.25 kg",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    stock: 25,
    featured: false,
    rating: 4.5,
    reviews: 118,
    description:
      "Acer Swift Go 14 - giá trị tuyệt vời với màn hình OLED 2.8K và Ryzen 7 7840U. Nhẹ, đẹp, pin tốt. Lựa chọn thông minh cho sinh viên.",
  },
  {
    id: 9,
    name: "LG Gram 17",
    brand: "LG",
    category: "van-phong",
    price: 35990000,
    originalPrice: 39990000,
    cpu: "Intel Core i7-1360P",
    ram: "16GB LPDDR5",
    storage: "512GB SSD",
    display: '17" IPS WQXGA',
    battery: "20 giờ",
    weight: "1.35 kg",
    gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
    stock: 9,
    featured: false,
    rating: 4.6,
    reviews: 95,
    description:
      "LG Gram 17 - màn hình 17 inch khổng lồ nhưng cực nhẹ chỉ 1.35kg. Pin 80Wh dùng đến 20 giờ. Đạt chuẩn MIL-SPEC 7 loại kiểm tra độ bền.",
  },
  {
    id: 10,
    name: "Samsung Galaxy Book4 Ultra",
    brand: "Samsung",
    category: "do-hoa",
    price: 55990000,
    originalPrice: 62990000,
    cpu: "Intel Core Ultra 9 185H",
    ram: "32GB LPDDR5",
    storage: "1TB SSD",
    display: '16" Dynamic AMOLED 2X 3K',
    battery: "12 giờ",
    weight: "1.86 kg",
    gradient: "linear-gradient(135deg, #1428A0 0%, #3d5af1 100%)",
    stock: 7,
    featured: true,
    rating: 4.8,
    reviews: 56,
    description:
      "Samsung Galaxy Book4 Ultra với màn hình Dynamic AMOLED 2X 3K tuyệt đẹp, tích hợp AI Galaxy. Core Ultra 9, RTX 4070 mạnh mẽ.",
  },
  {
    id: 11,
    name: "ASUS ZenBook 14X OLED",
    brand: "ASUS",
    category: "van-phong",
    price: 28990000,
    originalPrice: 32990000,
    cpu: "Intel Core i7-13700H",
    ram: "16GB LPDDR5",
    storage: "512GB SSD",
    display: '14" OLED 2.8K 120Hz',
    battery: "10 giờ",
    weight: "1.46 kg",
    gradient: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)",
    stock: 14,
    featured: false,
    rating: 4.6,
    reviews: 132,
    description:
      "ASUS ZenBook 14X OLED - màn hình OLED 2.8K 120Hz mãn nhãn, thiết kế nhôm sang trọng. Hiệu suất i7 mạnh mẽ trong thân hình mỏng nhẹ.",
  },
  {
    id: 12,
    name: "Razer Blade 15",
    brand: "Razer",
    category: "gaming",
    price: 58990000,
    originalPrice: 65990000,
    cpu: "Intel Core i9-13950HX",
    ram: "32GB DDR5",
    storage: "1TB SSD",
    display: '15.6" QHD 240Hz',
    battery: "8 giờ",
    weight: "2.01 kg",
    gradient: "linear-gradient(135deg, #134E5E 0%, #71B280 100%)",
    stock: 5,
    featured: false,
    rating: 4.7,
    reviews: 88,
    description:
      "Razer Blade 15 - gaming laptop mỏng nhất thế giới phân khúc gaming cao cấp. RTX 4080, QHD 240Hz trong khung nhôm CNC nguyên khối siêu đẳng cấp.",
  },
];

// ── Storage helpers ──────────────────────────────────────────

function loadProducts() {
  const stored = localStorage.getItem("tl_products");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }
  // First run: seed with defaults
  saveProducts(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

function saveProducts(products) {
  localStorage.setItem("tl_products", JSON.stringify(products));
}

function loadCart() {
  const stored = localStorage.getItem("tl_cart");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveCart(cart) {
  localStorage.setItem("tl_cart", JSON.stringify(cart));
}

function loadOrders() {
  const stored = localStorage.getItem("tl_orders");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveOrder(order) {
  const orders = loadOrders();
  orders.unshift(order);
  localStorage.setItem("tl_orders", JSON.stringify(orders));
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ── Formatter ────────────────────────────────────────────────

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function discountPercent(original, price) {
  return Math.round(((original - price) / original) * 100);
}

// ── Category labels ──────────────────────────────────────────

const CATEGORIES = {
  "tat-ca": "Tất Cả",
  "van-phong": "Văn Phòng",
  gaming: "Gaming",
  "do-hoa": "Đồ Họa",
};
