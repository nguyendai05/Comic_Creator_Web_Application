# 🧪 Hướng Dẫn Test Hoàn Chỉnh Authentication Flow

## 📋 Chuẩn Bị

**Server đang chạy tại:** http://localhost:5173

**Công cụ cần:**
- Trình duyệt web (Chrome/Firefox/Edge)
- DevTools Console (F12)

---

## ✅ Test 1: Trạng Thái Ban Đầu (Initial State)

### Bước thực hiện:
1. Mở trình duyệt
2. Truy cập: `http://localhost:5173`
3. Xóa localStorage (nếu đã test trước đó):
   - Mở DevTools (F12) → Tab Console
   - Chạy: `localStorage.clear()`
   - Refresh trang (F5)

### Kết quả mong đợi:
- ✅ Trang tự động chuyển đến `/login`
- ✅ Hiển thị form đăng nhập đẹp mắt
- ✅ Có thông tin Demo Credentials:
  - Email: demo@example.com
  - Password: demo123
- ✅ Có nút "Sign In"
- ✅ Có link "Sign up" ở cuối

---

## ✅ Test 2: Login Flow

### Bước thực hiện:
1. Trên trang `/login`
2. Nhập email: `demo@example.com`
3. Nhập password: `demo123`
4. Click nút "Sign In"

### Kết quả mong đợi:
- ✅ Nút hiển thị "Signing in..." với icon loading
- ✅ Form bị disable trong khi loading
- ✅ Sau ~100ms, tự động chuyển đến `/dashboard`
- ✅ Dashboard hiển thị:
  - Tiêu đề "Dashboard"
  - "Welcome back, **demo_user**!" (hoặc username khác)
  - "Credits: 100 • Tier: free"
  - Nút "Logout" màu đỏ

### Test Console:
```javascript
// Kiểm tra localStorage
const auth = JSON.parse(localStorage.getItem('comic-creator-auth'));
console.log('Auth State:', auth);

// Nên thấy:
// - user: { id, username, email, ... }
// - accessToken: "mock-jwt-token-..."
// - refreshToken: "mock-refresh-token-..."
// - isAuthenticated: true
```

---

## ✅ Test 3: Protected Routes (Đã Đăng Nhập)

### Bước thực hiện:
1. Đang ở `/dashboard` (đã đăng nhập)
2. Thử truy cập `/login` bằng cách:
   - Gõ trực tiếp vào address bar: `http://localhost:5173/login`
   - Hoặc click "Back" nếu có
3. Thử truy cập `/register` tương tự

### Kết quả mong đợi:
- ✅ Tự động redirect về `/dashboard`
- ✅ KHÔNG hiển thị form login/register
- ✅ URL bar luôn là `/dashboard`

---

## ✅ Test 4: Logout Flow

### Bước thực hiện:
1. Đang ở `/dashboard`
2. Click nút "Logout"

### Kết quả mong đợi:
- ✅ Tự động chuyển về `/login`
- ✅ Form login hiển thị lại
- ✅ Thử truy cập `/dashboard` → tự động redirect về `/login`

### Test Console:
```javascript
const auth = JSON.parse(localStorage.getItem('comic-creator-auth'));
console.log('After Logout:', auth);

// Nên thấy:
// - isAuthenticated: false
// - user: null
// - accessToken: null
```

---

## ✅ Test 5: Register Flow

### Bước thực hiện:
1. Ở trang `/login`, click "Sign up"
2. Hoặc truy cập trực tiếp: `http://localhost:5173/register`
3. Nhập thông tin:
   - Email: `testuser@example.com`
   - Username: `testuser`
   - Password: `TestUser123!`
   - Confirm Password: `TestUser123!` (phải giống password)

### Test Password Strength Indicator:
- Gõ từng ký tự và quan sát thanh màu
- ✅ Password ngắn (<8 ký tự): Thanh đỏ, "Weak password"
- ✅ Password 8-12 ký tự, có chữ thường: Thanh vàng, "Medium password"
- ✅ Password >12 ký tự, có chữ hoa, số, ký tự đặc biệt: Thanh xanh, "Strong password"

### Test Password Match:
- ✅ Gõ Confirm Password khớp → Icon ✓ xanh hiện bên phải
- ✅ Gõ không khớp → Không có icon

### Test Validation:
1. Submit form để trống → Shows "Please fill in all fields"
2. Email không hợp lệ (`test`) → "Please enter a valid email"
3. Username < 3 ký tự (`ab`) → "Username must be at least 3 characters"
4. Password < 8 ký tự (`abc123`) → "Password must be at least 8 characters"
5. Passwords không khớp → "Passwords do not match"

### Submit Form:
- Click "Create Account"
- ✅ Hiển thị "Creating account..." với loading
- ✅ Redirect đến `/dashboard`
- ✅ Dashboard hiển thị username mới: `testuser`

---

## ✅ Test 6: Auth Persistence (Lưu Trạng Thái)

### Bước thực hiện:
1. Đăng nhập (Test 2 hoặc Test 5)
2. Đang ở `/dashboard`
3. **Refresh trang (F5 hoặc Ctrl+R)**

### Kết quả mong đợi:
- ✅ Vẫn ở `/dashboard` (KHÔNG redirect về login)
- ✅ User data vẫn hiển thị đúng
- ✅ Credits, tier vẫn đúng

### Test Console:
```javascript
localStorage.getItem('comic-creator-auth')
// Vẫn có data đầy đủ
```

### Tiếp tục test:
1. Click "Logout"
2. **Refresh trang sau khi logout**

### Kết quả mong đợi:
- ✅ Vẫn ở `/login` (KHÔNG tự động đăng nhập lại)
- ✅ localStorage đã clear auth state

---

## ✅ Test 7: Error Handling

### Test 7A: Wrong Credentials
1. Ở `/login`
2. Nhập email: `wrong@example.com`
3. Nhập password: `wrongpass`
4. Click "Sign In"

**Kết quả:**
- ✅ Hiển thị error box màu đỏ: "Invalid credentials"
- ✅ Icon AlertCircle hiện bên cạnh
- ✅ Form KHÔNG bị disable
- ✅ Có thể thử lại

### Test 7B: Clear Error on Retry
1. Có error từ Test 7A
2. Bắt đầu gõ vào email hoặc password

**Kết quả:**
- ✅ Error message biến mất ngay lập tức

### Test 7C: Network Error (5% Random)
1. Thử login/register nhiều lần
2. Khoảng 1/20 lần sẽ thấy error: "Network error occurred"

**Kết quả:**
- ✅ Error hiển thị rõ ràng
- ✅ Có thể retry

---

## ✅ Test 8: Browser Console Inspection

### Mở DevTools Console (F12) và chạy:

```javascript
// 1. Kiểm tra localStorage
const authData = localStorage.getItem('comic-creator-auth');
console.log('Raw localStorage:', authData);
console.log('Parsed:', JSON.parse(authData));

// 2. Kiểm tra Zustand store (nếu có expose getState)
// Trong code: window.__authStore = useAuthStore
// Sau đó:
// window.__authStore.getState()

// 3. Kiểm tra structure
const auth = JSON.parse(authData);
console.log('User:', auth.state.user);
console.log('Is Authenticated:', auth.state.isAuthenticated);
console.log('Access Token:', auth.state.accessToken);
console.log('Refresh Token:', auth.state.refreshToken);
```

### Kết quả mong đợi:
```javascript
{
  "state": {
    "user": {
      "id": "user-...",
      "email": "demo@example.com",
      "username": "demo_user",
      "created_at": "2024-...",
      "subscription_tier": "free",
      "credits_balance": 100
    },
    "accessToken": "mock-jwt-token-...",
    "refreshToken": "mock-refresh-token-...",
    "isAuthenticated": true,
    "isLoading": false,
    "error": null
  },
  "version": 0
}
```

---

## ✅ Test 9: UI/UX Quality

### Kiểm tra giao diện:
- ✅ Gradient background đẹp (blue to indigo)
- ✅ Form có shadow, rounded corners
- ✅ Input có icon (Mail, Lock, User)
- ✅ Hover effects hoạt động
- ✅ Focus states (blue ring) hoạt động
- ✅ Disabled state hiển thị mờ
- ✅ Loading spinner quay tròn
- ✅ Password strength bars chuyển màu
- ✅ Error box màu đỏ nổi bật
- ✅ Buttons có transition mượt

### Kiểm tra responsive:
1. Resize window nhỏ lại
2. ✅ Form vẫn hiển thị tốt
3. ✅ Padding giữ khoảng cách hợp lý
4. ✅ Text không bị overflow

---

## ✅ Test 10: Edge Cases

### Test 10A: Direct URL Access (Not Logged In)
1. Logout
2. Gõ trực tiếp: `http://localhost:5173/dashboard`
3. ✅ Redirect về `/login`

### Test 10B: Root URL
1. Logout
2. Truy cập: `http://localhost:5173/`
3. ✅ Redirect về `/login`

### Test 10C: Root URL (Logged In)
1. Login
2. Truy cập: `http://localhost:5173/`
3. ✅ Redirect về `/dashboard`

### Test 10D: 404 Handling
1. Truy cập: `http://localhost:5173/nonexistent`
2. ✅ Redirect về `/` (sau đó về `/login` hoặc `/dashboard` tùy auth state)

---

## 📊 Checklist Tổng Hợp

### Core Functionality:
- [ ] Login works with demo credentials
- [ ] Register creates new user
- [ ] Logout clears state and redirects
- [ ] Protected routes block unauthorized access
- [ ] Already-logged-in users can't access login/register

### State Management:
- [ ] Auth state persists across page refreshes
- [ ] localStorage stores correct data
- [ ] Logout clears localStorage
- [ ] Zustand store updates correctly

### Validation:
- [ ] Email validation works
- [ ] Password length validation works
- [ ] Username length validation works
- [ ] Password match validation works
- [ ] Password strength indicator updates

### Error Handling:
- [ ] Wrong credentials show error
- [ ] Weak password shows error
- [ ] Network errors show error
- [ ] Errors clear on retry
- [ ] Validation errors display correctly

### UI/UX:
- [ ] Forms look beautiful
- [ ] Loading states work
- [ ] Icons display correctly
- [ ] Hover effects work
- [ ] Focus states work
- [ ] Responsive design works
- [ ] Smooth transitions

### Console:
- [ ] No console errors
- [ ] No console warnings
- [ ] localStorage structure correct

---

## 🎉 Expected Final Status

```
✅ Login works
✅ Register works
✅ Protected routes block unauthorized access
✅ Auth state persists across page refreshes
✅ Logout clears state and redirects
✅ Forms validate input
✅ Error messages display correctly
✅ Loading states work
✅ UI is responsive and looks good
✅ No console errors
```

---

## 🐛 Nếu Gặp Lỗi

### Lỗi TypeScript:
```bash
npx tsc --noEmit
```

### Lỗi Build:
```bash
# Restart dev server
Ctrl+C
npm run dev
```

### Lỗi LocalStorage:
```javascript
// Clear và thử lại
localStorage.clear();
location.reload();
```

### Lỗi Not Rendering:
1. Check terminal có báo lỗi không
2. Check browser console (F12)
3. Verify file paths đúng
4. Restart dev server

---

## 📝 Ghi Chú Thêm

### Mock API Behavior:
- Login/Register có delay ~100-500ms (simulate network)
- 5% chance network error (for testing)
- User data được lưu trong memory (mất khi refresh server)
- Auth tokens là mock strings

### Demo Credentials:
- Email: `demo@example.com`
- Password: `demo123`

### Test User Data:
- Email: `testuser@example.com`
- Username: `testuser`
- Password: `TestUser123!`

---

**⏱️ Estimated Testing Time:** 15-20 minutes

**🎯 Goal:** Verify all acceptance criteria pass before moving to Phase 4
