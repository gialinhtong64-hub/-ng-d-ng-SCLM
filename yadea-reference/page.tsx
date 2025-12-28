<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Xe máy điện - Trang giới thiệu</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --primary: #003366;
      --primary-soft: #0b3f7f;
      --accent: #f9b000;
      --bg: #f5f7fb;
      --text: #111827;
      --muted: #6b7280;
      --card-bg: #ffffff;
      --radius-lg: 18px;
      --radius-md: 12px;
      --shadow-soft: 0 15px 35px rgba(15, 23, 42, 0.08);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    a {
      text-decoration: none;
      color: inherit;
    }

    img {
      max-width: 100%;
      display: block;
    }

    .page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* HEADER */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--primary);
    }

    .logo-mark {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent), #ffe9a5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      color: #111827;
      font-weight: 900;
    }

    nav {
      display: flex;
      align-items: center;
      gap: 24px;
      font-size: 0.9rem;
    }

    nav a {
      color: var(--muted);
      font-weight: 500;
    }

    nav a:hover {
      color: var(--primary);
    }

    .nav-highlight {
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: #f9fafb;
      color: var(--primary-soft);
      font-size: 0.85rem;
    }

    .nav-cta {
      padding: 9px 18px;
      border-radius: 999px;
      border: none;
      background: var(--primary);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .nav-cta span {
      font-size: 1.1rem;
    }

    /* HERO */
    .hero {
      background: radial-gradient(circle at top left, #e5f1ff 0, #f5f7fb 45%, #ffffff 100%);
      border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    }

    .hero-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 20px 36px;
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.3fr);
      gap: 30px;
      align-items: center;
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.04);
      font-size: 0.78rem;
      color: var(--muted);
      margin-bottom: 12px;
    }

    .hero-tag-badge {
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(249, 176, 0, 0.1);
      color: #92400e;
      font-weight: 600;
      font-size: 0.72rem;
    }

    .hero h1 {
      font-size: clamp(1.9rem, 3vw, 2.4rem);
      line-height: 1.25;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 10px;
    }

    .hero h1 span {
      color: var(--primary);
    }

    .hero-sub {
      font-size: 0.96rem;
      color: var(--muted);
      max-width: 520px;
      margin-bottom: 18px;
    }

    .hero-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      margin: 12px 0 20px;
    }

    .metric {
      min-width: 120px;
    }

    .metric-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #9ca3af;
    }

    .metric-value {
      font-size: 1.15rem;
      font-weight: 700;
      color: #111827;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .btn-primary {
      padding: 11px 20px;
      border-radius: 999px;
      border: none;
      background: var(--primary);
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-secondary {
      padding: 11px 18px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.7);
      background: #ffffff;
      color: #111827;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .hero-note {
      margin-top: 8px;
      font-size: 0.78rem;
      color: var(--muted);
    }

    .hero-visual {
      position: relative;
    }

    .hero-card {
      background: radial-gradient(circle at top, #003366 0, #02101f 45%, #000 100%);
      border-radius: 26px;
      padding: 18px 18px 10px;
      color: #e5e7eb;
      box-shadow: 0 30px 60px rgba(15, 23, 42, 0.45);
      position: relative;
      overflow: hidden;
      min-height: 260px;
    }

    .hero-badge-corner {
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(148, 163, 184, 0.5);
    }

    .hero-badge-corner span {
      font-size: 0.95rem;
    }

    .hero-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .hero-card-title {
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .hero-card-sub {
      font-size: 0.82rem;
      color: #9ca3af;
    }

    .hero-card-logo {
      font-size: 0.8rem;
      text-align: right;
      color: #9ca3af;
    }

    .hero-bike {
      position: relative;
      margin: 8px 0 16px;
      padding-top: 10px;
    }

    .hero-bike-shape {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(56, 189, 248, 0.45), transparent 60%);
      opacity: 0.45;
    }

    .hero-bike-placeholder {
      position: relative;
      border-radius: 16px;
      border: 1px solid rgba(156, 163, 175, 0.4);
      padding: 18px 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: #e5e7eb;
      text-align: center;
      background: radial-gradient(circle at top, rgba(15, 23, 42, 0.3), rgba(3, 7, 18, 0.9));
    }

    .hero-bike-placeholder span {
      opacity: 0.9;
    }

    .hero-specs-row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      font-size: 0.75rem;
      margin-bottom: 6px;
    }

    .hero-spec-label {
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .hero-spec-value {
      font-weight: 600;
      color: #e5e7eb;
    }

    .hero-price {
      margin-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 0.9rem;
    }

    .hero-price-main {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fbbf24;
    }

    .hero-price-note {
      font-size: 0.75rem;
      color: #9ca3af;
      text-align: right;
    }

    /* FILTER BAR */
    .filter-bar {
      max-width: 1200px;
      margin: 18px auto 6px;
      padding: 0 20px 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
    }

    .filter-title {
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #6b7280;
    }

    .filter-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-pill {
      padding: 7px 12px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.7);
      font-size: 0.83rem;
      cursor: pointer;
      background: #ffffff;
      color: #4b5563;
    }

    .filter-pill.active {
      background: #111827;
      border-color: #111827;
      color: #f9fafb;
    }

    /* SECTIONS LAYOUT */
    main {
      flex: 1;
    }

    .section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 20px 24px;
    }

    .section-header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 14px;
    }

    .section-title {
      font-size: 1.05rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #6b7280;
      font-weight: 600;
    }

    .section-sub {
      font-size: 0.88rem;
      color: #9ca3af;
    }

    /* PRODUCT GRID */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }

    @media (max-width: 1024px) {
      .hero-inner {
        grid-template-columns: minmax(0, 1fr);
      }
      .hero-visual {
        order: -1;
      }
      .product-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 768px) {
      .header-inner {
        padding: 10px 16px;
      }

      nav {
        display: none;
      }

      .hero-inner {
        padding: 18px 16px 22px;
      }

      .product-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .section {
        padding: 16px;
      }
    }

    @media (max-width: 540px) {
      .product-grid {
        grid-template-columns: minmax(0, 1fr);
      }

      .filter-bar {
        padding-inline: 16px;
      }
    }

    .product-card {
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-soft);
      padding: 10px 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(226, 232, 240, 0.9);
    }

    .product-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #f97316;
      color: #fff;
      font-size: 0.7rem;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    .product-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(15, 23, 42, 0.85);
      color: #e5e7eb;
      font-size: 0.7rem;
      padding: 3px 8px;
      border-radius: 999px;
    }

    .product-image {
      border-radius: var(--radius-md);
      aspect-ratio: 4 / 3;
      background: linear-gradient(135deg, #e5e7eb, #cbd5f5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: #4b5563;
    }

    .product-content {
      padding: 2px 2px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .product-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #111827;
    }

    .product-desc {
      font-size: 0.8rem;
      color: #6b7280;
      min-height: 32px;
    }

    .product-meta {
      font-size: 0.78rem;
      color: #4b5563;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .product-meta strong {
      font-weight: 600;
    }

    .product-price-row {
      margin-top: 6px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
    }

    .product-price {
      font-size: 1rem;
      font-weight: 700;
      color: #111827;
    }

    .product-note {
      font-size: 0.72rem;
      color: #9ca3af;
      text-align: right;
    }

    .product-actions {
      margin-top: 8px;
      display: flex;
      gap: 8px;
    }

    .btn-buy {
      flex: 1;
      padding: 7px 10px;
      border-radius: 999px;
      border: none;
      background: #111827;
      color: #f9fafb;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-outline {
      padding: 7px 10px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.9);
      background: #fff;
      color: #4b5563;
      font-size: 0.8rem;
      cursor: pointer;
      white-space: nowrap;
    }

    /* SECTION 2 – CÁ TÍNH */
    .section-alt {
      background: #ffffff;
      border-radius: 24px;
      padding: 18px 18px 20px;
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(226, 232, 240, 0.9);
    }

    .product-grid-alt {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-top: 10px;
    }

    @media (max-width: 900px) {
      .product-grid-alt {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 620px) {
      .product-grid-alt {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    /* FORM – ƯU ĐÃI */
    .offer-section {
      margin-top: 10px;
      margin-bottom: 32px;
    }

    .offer-inner {
      background: linear-gradient(135deg, #0b3f7f, #020617);
      border-radius: 26px;
      padding: 20px 18px 18px;
      color: #e5e7eb;
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
      gap: 24px;
      border: 1px solid rgba(148, 163, 184, 0.5);
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.55);
    }

    @media (max-width: 900px) {
      .offer-inner {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .offer-left-title {
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #bfdbfe;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .offer-left h3 {
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .offer-left p {
      font-size: 0.9rem;
      color: #cbd5f5;
      margin-bottom: 10px;
      max-width: 420px;
    }

    .offer-bullets {
      font-size: 0.8rem;
      color: #e5e7eb;
      display: grid;
      gap: 4px;
      margin-bottom: 6px;
    }

    .offer-bullets span::before {
      content: "• ";
      color: #facc15;
    }

    .offer-note {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 4px;
    }

    .offer-form {
      display: grid;
      gap: 8px;
      font-size: 0.82rem;
    }

    .field-label {
      font-size: 0.8rem;
      color: #cbd5f5;
      margin-bottom: 2px;
    }

    .field-input,
    .field-select {
      width: 100%;
      padding: 8px 9px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.6);
      background: rgba(15, 23, 42, 0.8);
      color: #e5e7eb;
      font-size: 0.82rem;
      outline: none;
    }

    .field-input::placeholder {
      color: #6b7280;
    }

    .field-select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: linear-gradient(45deg, transparent 50%, #e5e7eb 50%), 
                        linear-gradient(135deg, #e5e7eb 50%, transparent 50%);
      background-position: right 10px top 50%, right 6px top 50%;
      background-size: 6px 6px, 6px 6px;
      background-repeat: no-repeat;
    }

    .offer-btn-row {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }

    .offer-btn {
      flex: 1;
      padding: 9px 14px;
      border-radius: 999px;
      border: none;
      background: #facc15;
      color: #111827;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .offer-secondary {
      padding: 9px 14px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.8);
      background: transparent;
      color: #e5e7eb;
      font-size: 0.78rem;
      cursor: pointer;
      white-space: nowrap;
    }

    /* FOOTER */
    footer {
      border-top: 1px solid rgba(148, 163, 184, 0.35);
      background: #020617;
      color: #9ca3af;
      margin-top: auto;
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 14px 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.78rem;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }

    .footer-links a {
      color: #9ca3af;
    }

    .footer-links a:hover {
      color: #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- HEADER -->
    <header>
      <div class="header-inner">
        <div class="logo">
          <div class="logo-mark">EV</div>
          <div>Electric Mobility</div>
        </div>
        <nav>
          <a href="#section-best">Sản phẩm bán chạy</a>
          <a href="#section-style">Xe cá tính</a>
          <a href="#section-offer" class="nav-highlight">Ưu đãi & trả góp</a>
          <button class="nav-cta">
            Tư vấn mua xe <span>›</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <div class="hero-tag">
            <span class="hero-tag-badge">MỚI</span>
            <span>Xe máy điện đô thị – tiết kiệm, bền bỉ, thân thiện môi trường</span>
          </div>
          <h1>Mua <span>xe máy điện</span> nhận ưu đãi linh hoạt & hỗ trợ trả góp dễ dàng.</h1>
          <p class="hero-sub">
            Di chuyển êm ái trong thành phố, chi phí sử dụng thấp, bảo hành rõ ràng. 
            Chọn ngay mẫu xe phù hợp nhu cầu đi làm, đi học hoặc kinh doanh.
          </p>

          <div class="hero-metrics">
            <div class="metric">
              <div class="metric-label">Quãng đường / lần sạc*</div>
              <div class="metric-value">Lên tới 200+ km</div>
            </div>
            <div class="metric">
              <div class="metric-label">Chi phí vận hành</div>
              <div class="metric-value">Chỉ vài nghìn / ngày</div>
            </div>
            <div class="metric">
              <div class="metric-label">Bảo hành</div>
              <div class="metric-value">Hỗ trợ dài hạn</div>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-primary">
              Xem tất cả xe
            </button>
            <button class="btn-secondary">
              So sánh dòng xe
            </button>
          </div>

          <p class="hero-note">
            *Quãng đường theo điều kiện tiêu chuẩn – tuỳ thuộc phong cách vận hành & tải trọng thực tế.
          </p>
        </div>

        <div class="hero-visual">
          <div class="hero-card">
            <div class="hero-badge-corner">
              <span>★</span>
              <span>Bán chạy 2025</span>
            </div>
            <div class="hero-card-header">
              <div>
                <div class="hero-card-title">CITY EV PRO</div>
                <div class="hero-card-sub">Mẫu xe đô thị – linh hoạt, hiện đại</div>
              </div>
              <div class="hero-card-logo">
                Electric<br />Mobility
              </div>
            </div>

            <div class="hero-bike">
              <div class="hero-bike-shape"></div>
              <div class="hero-bike-placeholder">
                <span>Khu vực hiển thị ảnh/3D xe máy điện nổi bật (thay bằng hình thực tế của anh).</span>
              </div>
            </div>

            <div class="hero-specs-row">
              <div>
                <div class="hero-spec-label">Quãng đường</div>
                <div class="hero-spec-value">~ 180 km / lần sạc</div>
              </div>
              <div>
                <div class="hero-spec-label">Tốc độ tối đa</div>
                <div class="hero-spec-value">49 km/h</div>
              </div>
              <div>
                <div class="hero-spec-label">Cốp xe</div>
                <div class="hero-spec-value">34 L – rộng rãi</div>
              </div>
            </div>

            <div class="hero-price">
              <div class="hero-price-main">Giá dự kiến từ 20.000.000 đ</div>
              <div class="hero-price-note">
                Có hỗ trợ trả góp & ưu đãi theo từng thời điểm.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="filter-bar">
        <div class="filter-title">SẢN PHẨM</div>
        <div class="filter-group">
          <button class="filter-pill active">Dòng cao cấp</button>
          <button class="filter-pill">Dòng trung cấp</button>
          <button class="filter-pill">Dòng phổ thông</button>
        </div>
      </div>
    </section>

    <!-- SECTION 1: SẢN PHẨM BÁN CHẠY -->
    <main>
      <section id="section-best" class="section">
        <div class="section-header">
          <div>
            <div class="section-title">SẢN PHẨM BÁN CHẠY</div>
            <div class="section-sub">
              Lựa chọn được nhiều khách hàng tin dùng – phù hợp nhu cầu di chuyển hàng ngày.
            </div>
          </div>
        </div>

        <div class="product-grid">
          <!-- Product 1 -->
          <article class="product-card">
            <div class="product-badge">BÁN CHẠY</div>
            <div class="product-image">
              Khu vực ảnh xe – Model A
            </div>
            <div class="product-content">
              <h3 class="product-name">Xe máy điện Model A</h3>
              <p class="product-desc">
                Thiết kế gọn, đẹp – phù hợp đi học, đi làm trong nội đô.
              </p>
              <div class="product-meta">
                <span><strong>Quãng đường:</strong> ~ 120 km / lần sạc</span>
                <span><strong>Cốp xe:</strong> rộng, chứa được nón bảo hiểm & đồ cá nhân</span>
              </div>
              <div class="product-price-row">
                <div class="product-price">Giá từ 15.900.000 đ</div>
                <div class="product-note">Tuỳ màu sắc & cấu hình pin</div>
              </div>
              <div class="product-actions">
                <button class="btn-buy">Mua ngay</button>
                <button class="btn-outline">Xem chi tiết</button>
              </div>
            </div>
          </article>

          <!-- Product 2 -->
          <article class="product-card">
            <div class="product-badge">BÁN CHẠY</div>
            <div class="product-tag">Quãng đường xa</div>
            <div class="product-image">
              Khu vực ảnh xe – Model B
            </div>
            <div class="product-content">
              <h3 class="product-name">Xe máy điện Model B</h3>
              <p class="product-desc">
                Chuyên cho hành trình dài, có thể nâng cấp pin kép.
              </p>
              <div class="product-meta">
                <span><strong>Quãng đường:</strong> tới ~ 200 km / lần sạc*</span>
                <span><strong>Động cơ:</strong> mạnh, bốc, êm ái</span>
              </div>
              <div class="product-price-row">
                <div class="product-price">Giá từ 18.000.000 đ</div>
                <div class="product-note">*Tuỳ cấu hình pin & cách sử dụng</div>
              </div>
              <div class="product-actions">
                <button class="btn-buy">Mua ngay</button>
                <button class="btn-outline">Xem chi tiết</button>
              </div>
            </div>
          </article>

          <!-- Product 3 -->
          <article class="product-card">
            <div class="product-badge">BÁN CHẠY</div>
            <div class="product-image">
              Khu vực ảnh xe – Model C
            </div>
            <div class="product-content">
              <h3 class="product-name">Xe máy điện Model C</h3>
              <p class="product-desc">
                Thiết kế trẻ trung, đèn LED hiện đại, dễ điều khiển.
              </p>
              <div class="product-meta">
                <span><strong>Quãng đường:</strong> ~ 80 km / lần sạc</span>
                <span><strong>Tính năng:</strong> màn hình điện tử, phanh an toàn</span>
              </div>
              <div class="product-price-row">
                <div class="product-price">Giá từ 14.400.000 đ</div>
                <div class="product-note">Ưu đãi theo từng đợt khuyến mãi</div>
              </div>
              <div class="product-actions">
                <button class="btn-buy">Mua ngay</button>
                <button class="btn-outline">Xem chi tiết</button>
              </div>
            </div>
          </article>

          <!-- Product 4 -->
          <article class="product-card">
            <div class="product-badge">BÁN CHẠY</div>
            <div class="product-tag">Dễ vận hành</div>
            <div class="product-image">
              Khu vực ảnh xe – Model D
            </div>
            <div class="product-content">
              <h3 class="product-name">Xe máy điện Model D</h3>
              <p class="product-desc">
                Phù hợp khách mới bắt đầu, cần xe tiết kiệm & bền.
              </p>
              <div class="product-meta">
                <span><strong>Quãng đường:</strong> ~ 100 km / lần sạc</span>
                <span><strong>Cốp:</strong> để vừa balo nhỏ & nhiều vật dụng</span>
              </div>
              <div class="product-price-row">
                <div class="product-price">Giá từ 17.800.000 đ</div>
                <div class="product-note">Có thể hỗ trợ trả góp hàng tháng</div>
              </div>
              <div class="product-actions">
                <button class="btn-buy">Mua ngay</button>
                <button class="btn-outline">Xem chi tiết</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- SECTION 2: XE CÁ TÍNH -->
      <section id="section-style" class="section">
        <div class="section-alt">
          <div class="section-header">
            <div>
              <div class="section-title">KHÁM PHÁ XE MÁY ĐIỆN CÁ TÍNH</div>
              <div class="section-sub">
                Dòng xe dành cho khách hàng thích phong cách riêng, đậm chất cá nhân.
              </div>
            </div>
          </div>

          <div class="product-grid-alt">
            <article class="product-card">
              <div class="product-tag">Mới</div>
              <div class="product-image">
                Ảnh xe – Urban X
              </div>
              <div class="product-content">
                <h3 class="product-name">Urban X</h3>
                <p class="product-desc">
                  Ngoại hình góc cạnh, năng động – phù hợp giới trẻ thích nổi bật.
                </p>
                <div class="product-meta">
                  <span><strong>Quãng đường:</strong> ~ 140 km / lần sạc</span>
                  <span><strong>Tính năng:</strong> đèn LED full, phanh đĩa</span>
                </div>
                <div class="product-price-row">
                  <div class="product-price">Giá từ 25.900.000 đ</div>
                  <div class="product-note">Tuỳ phiên bản & màu</div>
                </div>
                <div class="product-actions">
                  <button class="btn-buy">Mua ngay</button>
                  <button class="btn-outline">Xem chi tiết</button>
                </div>
              </div>
            </article>

            <article class="product-card">
              <div class="product-tag">Hai pin</div>
              <div class="product-image">
                Ảnh xe – Dual Power
              </div>
              <div class="product-content">
                <h3 class="product-name">Dual Power</h3>
                <p class="product-desc">
                  Hỗ trợ 2 pin song song – tăng quãng đường & hiệu suất di chuyển.
                </p>
                <div class="product-meta">
                  <span><strong>Quãng đường:</strong> tới ~ 220 km / lần sạc*</span>
                  <span><strong>Khả năng:</strong> leo dốc tốt, tải ổn định</span>
                </div>
                <div class="product-price-row">
                  <div class="product-price">Giá từ 29.900.000 đ</div>
                  <div class="product-note">*Khi sử dụng cấu hình pin cao nhất</div>
                </div>
                <div class="product-actions">
                  <button class="btn-buy">Mua ngay</button>
                  <button class="btn-outline">Xem chi tiết</button>
                </div>
              </div>
            </article>

            <article class="product-card">
              <div class="product-tag">Phong cách</div>
              <div class="product-image">
                Ảnh xe – Daily Style
              </div>
              <div class="product-content">
                <h3 class="product-name">Daily Style</h3>
                <p class="product-desc">
                  Phong cách đơn giản nhưng tinh tế, phù hợp sử dụng mỗi ngày.
                </p>
                <div class="product-meta">
                  <span><strong>Quãng đường:</strong> ~ 130 km / lần sạc</span>
                  <span><strong>Cốp:</strong> tối ưu dung tích, dễ bố trí đồ</span>
                </div>
                <div class="product-price-row">
                  <div class="product-price">Giá từ 23.900.000 đ</div>
                  <div class="product-note">Ưu đãi lãi suất trả góp hấp dẫn</div>
                </div>
                <div class="product-actions">
                  <button class="btn-buy">Mua ngay</button>
                  <button class="btn-outline">Xem chi tiết</button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- SECTION 3: NHẬN ƯU ĐÃI -->
      <section id="section-offer" class="section offer-section">
        <div class="offer-inner">
          <div class="offer-left">
            <div class="offer-left-title">NHẬN ƯU ĐÃI</div>
            <h3>Đăng ký nhận báo giá & chương trình khuyến mãi mới nhất.</h3>
            <p>
              Hãy để lại thông tin, đội ngũ tư vấn sẽ liên hệ để:
            </p>
            <div class="offer-bullets">
              <span>Tư vấn chọn mẫu xe phù hợp nhu cầu di chuyển.</span>
              <span>Cập nhật ưu đãi & chương trình trả góp theo từng thời điểm.</span>
              <span>Hỗ trợ đăng ký lái thử tại showroom gần khu vực của bạn.</span>
            </div>
            <p class="offer-note">
              Thông tin của bạn được bảo mật và chỉ dùng cho mục đích tư vấn mua xe.
            </p>
          </div>

          <form class="offer-form">
            <div>
              <label class="field-label">Họ và tên</label>
              <input class="field-input" type="text" placeholder="Nhập họ tên của bạn" required />
            </div>

            <div>
              <label class="field-label">Số điện thoại</label>
              <input class="field-input" type="tel" placeholder="VD: 09xx xxx xxx" required />
            </div>

            <div>
              <label class="field-label">Email</label>
              <input class="field-input" type="email" placeholder="Nhập email (nếu có)" />
            </div>

            <div>
              <label class="field-label">Tỉnh/Thành phố</label>
              <select class="field-select">
                <option value="">Chọn tỉnh/thành</option>
                <option>Hà Nội</option>
                <option>TP. Hồ Chí Minh</option>
                <option>Đà Nẵng</option>
                <option>Hải Phòng</option>
                <option>Cần Thơ</option>
                <!-- Anh thêm danh sách đầy đủ theo nhu cầu -->
              </select>
            </div>

            <div>
              <label class="field-label">Nhu cầu chính</label>
              <select class="field-select">
                <option>Đi làm</option>
                <option>Đi học</option>
                <option>Chạy dịch vụ / giao hàng</option>
                <option>Di chuyển gia đình</option>
                <option>Khác</option>
              </select>
            </div>

            <div class="offer-btn-row">
              <button type="submit" class="offer-btn">Gửi thông tin tư vấn</button>
              <button type="button" class="offer-secondary">
                Gọi hotline
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer>
      <div class="footer-inner">
        <div>© 2025 Electric Mobility – Trang giới thiệu xe máy điện (demo). Anh tự chỉnh tên brand & nội dung theo hệ thống của anh.</div>
        <div class="footer-links">
          <a href="#">Chính sách bảo hành</a>
          <a href="#">Hỗ trợ khách hàng</a>
          <a href="#">Tìm showroom</a>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>
