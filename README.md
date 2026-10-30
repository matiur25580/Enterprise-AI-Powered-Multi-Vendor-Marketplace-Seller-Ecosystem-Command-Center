# 🛒 Enterprise AI-Powered Multi-Vendor Marketplace & Seller Ecosystem Command Center

> A full-scale, enterprise-grade multi-vendor e-commerce platform with AI-driven recommendations, real-time logistics, financial command center, and 5 role-based dashboards.

**MERN Stack** — Buyer · Seller · Logistics Partner · Finance · Super Admin

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🌐 **Frontend** (Vercel) | `https://marketplace-ecosystem.vercel.app <!-- ⚠️ Vercel dashboard theke apnar asol URL niye ekhane bosan -->
| ⚙️ **Backend API** (Render) | `https://enterprise-ai-powered-multi-vendor.onrender.com` |
| 📦 **GitHub** | `https://github.com/matiur25580/Enterprise-AI-Powered-Multi-Vendor-Marketplace-Seller-Ecosystem-Command-Center` |

> ⚠️ Backend free-tier Render-e host kora — prothom request-e ~50 sec spin-up lagte pare.

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Smart Recommendations** — browsing history + purchase pattern basis-e personalized product suggestions
- **Frequently Bought Together** — cart affinity analysis
- **Sales Forecast** — seller dashboard-e AI-driven demand prediction chart
- **Smart Badges** — auto-generated `🔥 Trending`, `⚡ Flash Deal`, `✅ Verified Seller` badges
- **Fraud Detection Badges** — logistics-e suspicious order flagging

### 🛍️ Buyer Experience
- Multi-seller product catalog with live search, filters & category browse
- Cart drawer with multi-seller split checkout
- **Wishlist** + **Price-Drop Alerts** (wishlist-er product-e flash deal aslei auto notification 🔔)
- **Recently Viewed** products row
- Order tracking timeline (Placed → Packed → Shipped → Out for Delivery → Delivered)
- Reviews & ratings, coupon codes, delivery notes
- **Wallet** with cashback on every purchase + transaction history
- **Referral System** — nijer code share koro, duijonei wallet bonus pao
- **Loyalty Tiers** — Bronze 🥉 → Silver 🥈 → Gold 🥇 (tier onujayi extra cashback %)
- Downloadable **invoices** (PDF-ready), return requests with reason

### 🏪 Seller Command Center
- Product CRUD with stock management, image & warehouse mapping
- Orders pipeline, revenue chart & analytics
- **Flash Deals** with countdown timer + auto price-drop notifications to wishlist users
- Coupon manager (create / activate / deactivate)
- Customer reviews dashboard
- **KYC Verification** — submit documents, admin approval workflow
- **Returns Management** — approve / reject return requests
- Sales forecast & CSV export of products/orders

### 🚚 Logistics Partner
- Dispatch → In-Transit → Delivered flow with tracking ID
- Fraud-risk badges on suspicious orders
- Delivery notes & warehouse coordination

### 💰 Finance Dashboard
- **GMV** (Gross Merchandise Value) real-time tracking
- Platform **commission** (configurable %, default 10%) auto-calculation
- Seller payout management & settlement reports

### 👑 Super Admin
- Platform-wide stats with charts (users, orders, revenue, GMV)
- User management — role-wise list, **block / unblock**
- **Platform Settings** — commission %, cashback %, referral bonus configurable (live, no redeploy)
- Announcements broadcaster (all users notified 🔔)
- Featured products curation
- Seller KYC approval queue
- Activity feed — sob important event-er real-time log
- One-click **seed data** for demo

---

## 🔐 Authentication System

| Feature | Details |
|---|---|
| **OTP** | Real 6-digit email OTP via **Brevo HTTP API** (Render blocks SMTP ports) |
| **Unique ID** | Auto-generated `XYZDDMMYYYY` format — X=role initial, Y=name initial, Z=surname initial (e.g. `SMR29081998`) |
| **Login** | Email **OR** Unique ID + password |
| **Multi-role** | Same email can register for **all 5 roles** (unique = email + role) |
| **Forgot Password** | Role selection + email OTP + reset |
| **Security** | JWT tokens, bcrypt password hashing, admin block/unblock |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite), react-router-dom, Context API |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Email** | Brevo HTTP API (native `fetch`, zero extra dependency) |
| **Auth** | JWT + bcrypt + 6-digit OTP |
| **Charts** | Custom SVG/Recharts-style dashboard charts |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **Notifications** | In-app bell 🔔 + transactional emails |

---

## 📁 Project Structure

```
marketplace-ecosystem/
├── client/                      # React (Vite) frontend
│   └── src/
│       ├── dashboards/          # 5 role dashboards
│       │   ├── BuyerDash.jsx
│       │   ├── SellerDash.jsx
│       │   ├── LogisticsDash.jsx
│       │   ├── FinanceDash.jsx
│       │   └── AdminDash.jsx
│       ├── components/          # NotifBell, ThemeToggle, etc.
│       ├── context/             # Auth, Theme, Language
│       └── pages/               # Landing, Login, Register, ForgotPassword
├── server/                      # Node.js + Express backend
│   ├── routes/
│   │   ├── auth.js              # OTP, login, register, forgot-password
│   │   └── shop.js              # 68 marketplace API routes
│   ├── models/                  # 16 Mongoose models
│   │   ├── User, Product, Order, Wallet, Deal, Coupon,
│   │   ├── Review, Wishlist, Notification, Announcement,
│   │   ├── Return, KYC, Config, Referral, Payout, Otp
│   ├── middleware/auth.js       # JWT protect + role allow
│   └── utils/email.js           # Brevo email via native fetch
└── render.yaml                  # Render deploy config
```

---

## 🔌 API Reference (68 routes)

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-otp` | Send 6-digit OTP to email |
| POST | `/register` | Register + generate Unique ID |
| POST | `/verify-otp` | Verify OTP |
| POST | `/login` | Login with email / Unique ID |
| POST | `/forgot-password` | Role + email → OTP |
| POST | `/reset-password` | Reset with OTP |

### Shop (`/api/shop`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List products (filters, search) |
| POST | `/orders` | Multi-seller checkout |
| GET | `/wallet` | Wallet balance + transactions |
| GET | `/loyalty` | Loyalty tier & cashback rate |
| GET | `/recommendations` | AI product recommendations |
| GET | `/deals/active` | Live flash deals |
| POST | `/referral/apply` | Apply referral code |
| GET | `/config` | Platform settings |
| PATCH | `/admin/config` | Update commission/cashback/referral |
| GET | `/notifications` | User notifications |
| POST | `/returns` | Request return |
| PATCH | `/returns/:id` | Approve / reject return |

> Full 68-route list: see `server/routes/shop.js`

---

## ⚙️ Environment Variables

### Backend (`server/.env` — never commit!)
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/marketplace
JWT_SECRET=your_super_secret_jwt_key
BREVO_API_KEY=xkeysib-your-brevo-api-key
EMAIL_FROM=noreply@yourdomain.com
PORT=10000
```

### Frontend (`client/.env`)
```env
VITE_API_URL=https://enterprise-ai-powered-multi-vendor.onrender.com/api
```

---

## 🏃‍♂️ Run Locally

```bash
# Backend
cd server
npm install
npm start          # → http://localhost:10000

# Frontend (new terminal)
cd client
npm install
npm run dev        # → http://localhost:5173
```

---

## 🚢 Deployment

| Part | Platform | Config |
|---|---|---|
| Frontend | **Vercel** | Auto-deploy on `git push` → `client/` |
| Backend | **Render** | Auto-deploy on `git push` → `server/`, start: `node server.js` |

---

## 📊 Platform Config (Admin → Settings)

| Setting | Default | Description |
|---|---|---|
| `commissionPct` | 10% | Platform cut per order |
| `cashbackPct` | 1% | Buyer wallet cashback |
| `referralBonus` | ৳50 | Bonus for referrer + referee |

Changes apply **instantly** — no redeploy needed.

---

## 🗺️ Roadmap

- [ ] Real-time chat (buyer ↔ seller)
- [ ] Stripe / bKash / Nagad payment gateway
- [ ] Mobile app (React Native)
- [ ] Multi-language (BN / EN) full coverage
- [ ] AI chatbot support agent

---

## 👨‍💻 Author

**Rubel Ali** — MERN Full-Stack Developer
- GitHub: [@matiur25580](https://github.com/matiur25580)
- 📧 rahamanmatiur397@gmail.com

---

<p align="center">⭐ Star this repo if you found it useful!</p>
