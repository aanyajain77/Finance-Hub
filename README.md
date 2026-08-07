# MSME Financial Health Monitoring Platform 📊

An intuitive, real-time financial intelligence dashboard engineered specifically for non-technical small business owners and startup founders. This platform aggregates fragmented banking and accounting data into highly scannable, actionable insights.

## 🌟 Key Features

* **Real-time Cash Runway Clock**: Displays exact months of remaining operational runway based on live burn rates.
* **Interactive "What-If" Simulator**: Dynamic slider allowing users to simulate the financial impact of hiring, scaling, or client loss.
* **Automated Expense Anomaly Detection**: Categorizes fixed vs. variable spending and flags unusual vendor billing spikes.
* **Simplified Jargon engine**: Translates complex terms like *Accounts Receivable* into *"Money Owed to You"*.
* **One-Click Financial Export**: Instant PDF balance sheets compiled directly from the dashboard header for bank loans or tax filing.

## 🚀 Tech Stack

We recommend and use the following stack for optimal data visualization and mobile responsiveness:
* **Frontend**: React.js / Next.js (TailwindCSS for layout, Recharts for lightweight charts)
* **Backend**: Node.js with Express (Fast data processing) or Python FastAPI (if integrating heavy predictive models)
* **Database**: PostgreSQL (for secure, relational ledger balances)
* **Integrations**: Plaid API / Finicity (for secure automated bank feed synchronization)

## 🎨 UI/UX Design System Checklist

- [ ] **Top-Fold Summary**: 3 distinct high-level summary cards (Revenue, Expenses, Net Profit).
- [ ] **Color Psychology**: Emerald Green (`#10B981`) for positive cash flow; Crimson Red (`#EF4444`) for critical risks.
- [ ] **Accessibility**: Soft, low-saturation backgrounds to reduce visual fatigue during daily audits.
- [ ] **Mobile Responsive**: Flexbox layouts prioritizing single-column stack views on viewports below 768px.

## The deployed link🔗
https://finance-hub-eight-delta.vercel.app/

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd msme-financial-monitor
   ```

2. **Setup the Backend Engine:**
   ```bash
   cd server
   npm install
   # Create a .env file with your DB_CONNECT and PLAID_API_KEY
   npm start
   ```

3. **Setup the Frontend Dashboard:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
