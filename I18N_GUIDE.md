# 🌍 HỆ THỐNG ĐA NGÔN NGỮ (i18n)

## ✅ ĐÃ HOÀN THÀNH:

### 📦 Files đã tạo:
- ✅ `src/i18n/translations.ts` - Chứa tất cả translations (VI, EN, ZH)
- ✅ `src/i18n/LanguageContext.tsx` - Context quản lý ngôn ngữ
- ✅ `src/i18n/LanguageSelector.tsx` - Component chọn ngôn ngữ

### 🎯 Tính năng:
- ✅ 3 ngôn ngữ: Tiếng Việt 🇻🇳, English 🇺🇸, 中文 🇨🇳
- ✅ Lưu ngôn ngữ vào localStorage
- ✅ Dropdown selector với flags
- ✅ Auto-save khi thay đổi

---

## 📋 CÁCH SỬ DỤNG:

### 1. Trong Component (React):

```tsx
import { useLanguage } from '../i18n/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t.common.welcome}</h1>
      <p>{t.auth.username}</p>
      <button onClick={() => setLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### 2. Thêm Language Selector:

```tsx
import LanguageSelector from '../i18n/LanguageSelector';

function Header() {
  return (
    <div className="header">
      <h1>My App</h1>
      <LanguageSelector />
    </div>
  );
}
```

### 3. Example - ProfileScreen:

```tsx
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from '../i18n/LanguageSelector';

const ProfileScreen = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h2>{t.profile.title}</h2>
      <p>{t.profile.accountInfo}</p>
      
      {/* Phần cài đặt */}
      <div className="settings-section">
        <h3>{t.profile.language}</h3>
        <LanguageSelector />
      </div>
    </div>
  );
};
```

---

## 🎨 THÊM TRANSLATIONS MỚI:

### Bước 1: Thêm key vào interface trong `translations.ts`:

```typescript
export interface Translations {
  // ... existing
  myNewSection: {
    title: string;
    description: string;
  };
}
```

### Bước 2: Thêm translations cho 3 ngôn ngữ:

```typescript
// Vietnamese
export const vi: Translations = {
  // ... existing
  myNewSection: {
    title: 'Tiêu đề mới',
    description: 'Mô tả mới',
  },
};

// English
export const en: Translations = {
  // ... existing
  myNewSection: {
    title: 'New Title',
    description: 'New Description',
  },
};

// Chinese
export const zh: Translations = {
  // ... existing
  myNewSection: {
    title: '新标题',
    description: '新描述',
  },
};
```

---

## 🔧 TÍCH HỢP VÀO CÁC SCREEN:

### HomeScreen:
```tsx
const { t } = useLanguage();
<h1>{t.nav.home}</h1>
<button>{t.orders.newOrder}</button>
```

### WalletScreen:
```tsx
const { t } = useLanguage();
<h2>{t.wallet.title}</h2>
<span>{t.wallet.balance}: ${balance}</span>
<button>{t.wallet.deposit}</button>
```

### OrdersScreen:
```tsx
const { t } = useLanguage();
<h2>{t.orders.title}</h2>
<div>{t.orders.pendingOrders}</div>
```

### BankerDashboard:
```tsx
const { t } = useLanguage();
<h1>{t.banker.title}</h1>
<button>{t.banker.approveDeposit}</button>
```

---

## 📍 VỊ TRÍ ĐẶT LANGUAGE SELECTOR:

### User App:
- ✅ ProfileScreen → Settings Section
- ✅ LoginScreen → Top right corner
- ✅ RegisterScreen → Top right corner

### Banker Dashboard:
- ✅ Header → Top right (cạnh username)
- ✅ Settings panel

---

## 🎯 TODO - VIỆC CẦN LÀM:

### ✅ Đã làm:
1. ✅ Tạo translation files
2. ✅ Tạo LanguageContext
3. ✅ Tạo LanguageSelector component
4. ✅ Wrap App với LanguageProvider

### ⏳ Cần làm tiếp:
1. ⏳ Thêm LanguageSelector vào ProfileScreen
2. ⏳ Thêm LanguageSelector vào LoginScreen
3. ⏳ Thêm LanguageSelector vào BankerDashboard header
4. ⏳ Replace tất cả text cứng bằng `t.xxx.yyy`
5. ⏳ Test chuyển đổi ngôn ngữ
6. ⏳ Thêm translations cho alert messages

---

## 🚀 NEXT STEPS:

1. **Thêm vào ProfileScreen**:
```tsx
// Import
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from '../i18n/LanguageSelector';

// Trong component
const { t } = useLanguage();

// Trong render (phần Settings)
<div className="setting-item">
  <span>{t.profile.language}</span>
  <LanguageSelector />
</div>
```

2. **Thêm vào LoginScreen header**:
```tsx
<div className="header-right">
  <LanguageSelector />
</div>
```

3. **Thêm vào BankerDashboard**:
```tsx
<div className="dashboard-header">
  <h1>{t.banker.dashboard}</h1>
  <LanguageSelector />
</div>
```

---

Anh muốn em thêm vào screen nào trước? 🎨
