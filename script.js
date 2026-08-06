const defaultState = {
  user: { name: 'Asha Sharma', email: 'asha@coastalcrafts.in' },
  users: [
    { name: 'Asha Sharma', email: 'asha@coastalcrafts.in', password: 'demo123' },
  ],
  transactions: [
    { id: 1, type: 'income', category: 'Sales', amount: 145000, description: 'Client Order #101 - Coastal Art', date: '2026-05-10' },
    { id: 2, type: 'expense', category: 'Raw Materials', amount: 32000, description: 'Wood & Terracotta Batch', date: '2026-05-12' },
    { id: 3, type: 'income', category: 'Export Order', amount: 180000, description: 'Handicraft Export Invoice #102', date: '2026-05-24' },
    { id: 4, type: 'expense', category: 'Marketing', amount: 15000, description: 'Google & Meta Ads Campaign', date: '2026-06-02' },
    { id: 5, type: 'income', category: 'Services', amount: 65000, description: 'Design Consultation Fee', date: '2026-06-15' },
    { id: 6, type: 'expense', category: 'Rent', amount: 25000, description: 'Showroom & Workshop Rent', date: '2026-06-20' },
    { id: 7, type: 'income', category: 'Sales', amount: 120000, description: 'Retail Distributor Payment', date: '2026-07-05' },
    { id: 8, type: 'expense', category: 'Utilities', amount: 8500, description: 'Electricity & Internet Bill', date: '2026-07-12' },
    { id: 9, type: 'income', category: 'Sales', amount: 160000, description: 'Festive Season Pre-orders', date: '2026-07-28' },
    { id: 10, type: 'expense', category: 'Payroll', amount: 45000, description: 'Artisan Staff Salaries', date: '2026-08-01' },
    { id: 11, type: 'income', category: 'Sales', amount: 95000, description: 'Online Store Sales', date: '2026-08-04' },
  ],
  invoices: [
    {
      id: 1,
      number: 'INV-2026-004',
      client: 'Apex Retail Private Ltd',
      date: '2026-08-06',
      item: 'Handicraft Supply Batch A',
      qty: 10,
      rate: 2500,
      gstRate: 18,
      subtotal: 25000,
      gstAmount: 4500,
      total: 29500,
    }
  ],
  parties: [
    { id: 1, name: 'Royal Artisans Wholesale', type: 'receivable', amount: 42000, dueDate: '2026-08-15', status: 'Pending' },
    { id: 2, name: 'Eco Wood Suppliers', type: 'payable', amount: 18500, dueDate: '2026-08-10', status: 'Pending' },
    { id: 3, name: 'Metro Emporium', type: 'receivable', amount: 28000, dueDate: '2026-08-25', status: 'Pending' },
  ],
  settings: { theme: 'light', notifications: true, voice: true, gstReminder: true },
  goal: { target: 50000, current: 0 },
  plan: { monthlyBudget: 150000, targetProfit: 80000, savingsGoal: 50000 },
};

let state = null;
let monthlyChart = null;
let flowChart = null;
let categoryChart = null;
let recognition = null;
let editingId = null;
let activeTxFilter = 'all';

function loadState() {
  const saved = localStorage.getItem('msmeFinanceState_v2');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = {
        ...defaultState,
        ...parsed,
        settings: { ...defaultState.settings, ...(parsed.settings || {}) },
        goal: { ...defaultState.goal, ...(parsed.goal || {}) },
        plan: { ...defaultState.plan, ...(parsed.plan || {}) },
        transactions: parsed.transactions || defaultState.transactions,
        invoices: parsed.invoices || defaultState.invoices,
        parties: parsed.parties || defaultState.parties,
      };
    } catch (e) {
      state = JSON.parse(JSON.stringify(defaultState));
    }
  } else {
    state = JSON.parse(JSON.stringify(defaultState));
    saveState();
  }
}

function saveState() {
  localStorage.setItem('msmeFinanceState_v2', JSON.stringify(state));
}

function resetToDefaultState() {
  state = JSON.parse(JSON.stringify(defaultState));
  saveState();
  render();
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.body.classList.toggle('dark-theme', isDark);
  document.body.classList.toggle('light-theme', !isDark);
  document.documentElement.style.colorScheme = theme;
}

function syncAuthUI() {
  const overlay = document.getElementById('loginOverlay');
  const app = document.getElementById('appShell');
  const isAuthenticated = Boolean(state?.user?.email);

  overlay?.classList.toggle('hidden', isAuthenticated);
  app?.classList.toggle('hidden', !isAuthenticated);
}

function hideLoadingScreen() {
  const loader = document.getElementById('loadingScreen');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 400);
    }, 800);
  }
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach((panel) => panel.classList.add('hidden'));
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.classList.add('animate-fade-in');
    activeSection.setAttribute('tabindex', '-1');
    activeSection.focus({ preventScroll: true });
  }

  document.querySelectorAll('.nav-link').forEach((button) => {
    const isTarget = button.dataset.section === sectionId;
    button.classList.toggle('bg-emerald-50', isTarget);
    button.classList.toggle('text-emerald-700', isTarget);
    button.classList.toggle('dark:bg-slate-800', isTarget);
    button.classList.toggle('dark:text-emerald-400', isTarget);
  });
}

function attachNavigationEvents() {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const backdrop = document.getElementById('sidebarBackdrop');

  function openMobileSidebar() {
    sidebar?.classList.add('open');
    backdrop?.classList.remove('hidden');
  }

  function closeMobileSidebar() {
    sidebar?.classList.remove('open');
    backdrop?.classList.add('hidden');
  }

  menuToggle?.addEventListener('click', openMobileSidebar);
  menuCloseBtn?.addEventListener('click', closeMobileSidebar);
  backdrop?.addEventListener('click', closeMobileSidebar);

  document.querySelectorAll('.nav-link').forEach((button) => {
    button.addEventListener('click', () => {
      const section = button.dataset.section;
      showSection(section);
      if (window.innerWidth < 1024) closeMobileSidebar();
    });
  });

  document.getElementById('quickAddBtn')?.addEventListener('click', () => {
    showSection('tracker');
    document.getElementById('amount')?.focus();
  });
}

function attachEvents() {
  attachNavigationEvents();

  // Auth Events
  document.getElementById('showSigninBtn')?.addEventListener('click', () => toggleAuthMode('signin'));
  document.getElementById('showSignupBtn')?.addEventListener('click', () => toggleAuthMode('signup'));
  document.getElementById('signinForm')?.addEventListener('submit', handleSignin);
  document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Theme Toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const nextTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    state.settings.theme = nextTheme;
    applyTheme(nextTheme);
    saveState();
  });

  // Transaction Form Submit & Edit
  const txForm = document.getElementById('transactionForm');
  const cancelBtn = document.getElementById('cancelEditBtn');

  txForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value.trim() || 'General';
    const amount = Number(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim() || 'Entry';
    const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];

    if (editingId) {
      state.transactions = state.transactions.map((item) =>
        item.id === editingId ? { ...item, type, category, amount, description, date } : item
      );
      editingId = null;
      document.getElementById('saveTransactionBtn').textContent = 'Save Entry';
      cancelBtn?.classList.add('hidden');
    } else {
      const newEntry = { id: Date.now(), type, category, amount, description, date };
      state.transactions.unshift(newEntry);
    }

    saveState();
    txForm.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    render();
  });

  cancelBtn?.addEventListener('click', () => {
    editingId = null;
    txForm?.reset();
    document.getElementById('saveTransactionBtn').textContent = 'Save Entry';
    cancelBtn.classList.add('hidden');
  });

  // Transaction Filters & Search
  document.getElementById('searchTransactions')?.addEventListener('input', () => {
    renderTransactions();
  });

  document.getElementById('filterAll')?.addEventListener('click', (e) => setTxFilter('all', e.target));
  document.getElementById('filterIncome')?.addEventListener('click', (e) => setTxFilter('income', e.target));
  document.getElementById('filterExpense')?.addEventListener('click', (e) => setTxFilter('expense', e.target));

  // AI Assistant Toggle & Chat
  document.getElementById('assistantToggle')?.addEventListener('click', () => {
    document.getElementById('assistantPanel')?.classList.toggle('hidden');
  });
  document.getElementById('closeAssistant')?.addEventListener('click', () => {
    document.getElementById('assistantPanel')?.classList.add('hidden');
  });
  document.getElementById('sendChat')?.addEventListener('click', sendAssistantReply);
  document.getElementById('chatInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendAssistantReply();
  });

  document.querySelectorAll('.quick-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const promptText = chip.dataset.prompt;
      if (promptText) {
        document.getElementById('chatInput').value = promptText;
        sendAssistantReply();
      }
    });
  });

  // Voice Toggle
  document.getElementById('voiceToggle')?.addEventListener('click', toggleVoiceRecognition);

  // Settings Toggles
  document.getElementById('notifToggle')?.addEventListener('change', (event) => {
    state.settings.notifications = event.target.checked;
    saveState();
  });
  document.getElementById('voiceAssistToggle')?.addEventListener('change', (event) => {
    state.settings.voice = event.target.checked;
    saveState();
  });
  document.getElementById('gstToggle')?.addEventListener('change', (event) => {
    state.settings.gstReminder = event.target.checked;
    saveState();
  });

  document.getElementById('saveGoalBtn')?.addEventListener('click', () => {
    const value = Number(document.getElementById('goalInput')?.value || 50000);
    state.goal.target = value;
    saveState();
    render();
  });

  document.getElementById('budgetForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.plan.monthlyBudget = Number(document.getElementById('budgetInput')?.value || state.plan.monthlyBudget);
    state.plan.targetProfit = Number(document.getElementById('profitTargetInput')?.value || state.plan.targetProfit);
    state.plan.savingsGoal = Number(document.getElementById('savingsTargetInput')?.value || state.plan.savingsGoal);
    saveState();
    render();
  });

  document.getElementById('resetDemoBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data to default demo state?')) {
      resetToDefaultState();
    }
  });

  // Export Buttons
  document.getElementById('pdfExport')?.addEventListener('click', () => window.print());
  document.getElementById('excelExport')?.addEventListener('click', exportToExcel);

  // Invoice Creator Events
  document.getElementById('invoiceForm')?.addEventListener('submit', handleCreateInvoice);
  document.getElementById('printInvoiceBtn')?.addEventListener('click', () => window.print());

  // Khata Ledger Events
  document.getElementById('partyForm')?.addEventListener('submit', handleAddParty);

  // GST Calculator Events
  document.getElementById('calcGstBtn')?.addEventListener('click', handleCalculateGst);
}

function setTxFilter(filter, buttonEl) {
  activeTxFilter = filter;
  document.querySelectorAll('.tx-filter-btn').forEach((btn) => {
    btn.classList.remove('bg-white', 'text-emerald-700', 'dark:bg-slate-700', 'dark:text-emerald-400', 'font-bold');
    btn.classList.add('text-slate-600', 'dark:text-slate-300');
  });
  buttonEl?.classList.add('bg-white', 'text-emerald-700', 'dark:bg-slate-700', 'dark:text-emerald-400', 'font-bold');
  buttonEl?.classList.remove('text-slate-600', 'dark:text-slate-300');
  renderTransactions();
}

function toggleAuthMode(mode) {
  const signinBtn = document.getElementById('showSigninBtn');
  const signupBtn = document.getElementById('showSignupBtn');

  signinBtn?.classList.toggle('bg-emerald-600', mode === 'signin');
  signinBtn?.classList.toggle('text-white', mode === 'signin');
  signupBtn?.classList.toggle('bg-emerald-600', mode === 'signup');
  signupBtn?.classList.toggle('text-white', mode === 'signup');

  signinBtn?.classList.toggle('text-slate-600', mode === 'signup');
  signupBtn?.classList.toggle('text-slate-600', mode === 'signin');

  document.getElementById('signinForm')?.classList.toggle('hidden', mode === 'signup');
  document.getElementById('signupForm')?.classList.toggle('hidden', mode === 'signin');
}

function handleSignin(event) {
  event.preventDefault();
  const email = document.getElementById('signinEmail').value.trim();
  const password = document.getElementById('signinPassword').value;
  const user = state.users.find((entry) => entry.email === email && entry.password === password);
  const msgEl = document.getElementById('authMessage');

  if (user) {
    state.user = { name: user.name, email: user.email };
    saveState();
    if (msgEl) msgEl.textContent = '';
    syncAuthUI();
    render();
  } else {
    if (msgEl) msgEl.textContent = 'Invalid email or password. Use demo credentials.';
  }
}

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const msgEl = document.getElementById('authMessage');

  if (!name || !email || !password) {
    if (msgEl) msgEl.textContent = 'Please fill out all fields.';
    return;
  }
  if (state.users.some((u) => u.email === email)) {
    if (msgEl) msgEl.textContent = 'An account with this email already exists.';
    return;
  }

  state.users.push({ name, email, password });
  state.user = { name, email };
  saveState();
  if (msgEl) msgEl.textContent = '';
  syncAuthUI();
  render();
}

function handleLogout() {
  state.user = { name: '', email: '' };
  saveState();
  syncAuthUI();
  document.getElementById('signinForm')?.reset();
  document.getElementById('signupForm')?.reset();
  toggleAuthMode('signin');
}

/* ---------------- Dynamic Aggregations ---------------- */

function getAggregates() {
  const income = state.transactions.filter((t) => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = state.transactions.filter((t) => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const profit = income - expenses;
  // Estimated Cash Reserve based on net balance + initial buffer
  const cashReserve = Math.max(0, profit + 60000);
  const monthlyAvgExpense = expenses > 0 ? expenses / 3 : 30000;
  const runwayMonths = (cashReserve / (monthlyAvgExpense || 1)).toFixed(1);

  return { income, expenses, profit, cashReserve, runwayMonths };
}

function getMonthlyData() {
  const monthsMap = {};

  state.transactions.forEach((tx) => {
    if (!tx.date) return;
    const dateObj = new Date(tx.date);
    const monthKey = dateObj.toLocaleString('en-US', { month: 'short' });
    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = { revenue: 0, expenses: 0 };
    }
    if (tx.type === 'income') {
      monthsMap[monthKey].revenue += tx.amount;
    } else {
      monthsMap[monthKey].expenses += tx.amount;
    }
  });

  const labels = Object.keys(monthsMap);
  if (!labels.length) {
    return { labels: ['May', 'Jun', 'Jul', 'Aug'], revenue: [0, 0, 0, 0], expenses: [0, 0, 0, 0], profit: [0, 0, 0, 0] };
  }

  const revenue = labels.map((m) => monthsMap[m].revenue);
  const expenses = labels.map((m) => monthsMap[m].expenses);
  const profit = labels.map((m) => monthsMap[m].revenue - monthsMap[m].expenses);

  return { labels, revenue, expenses, profit };
}

function getCategoryExpensesData() {
  const categoryMap = {};
  state.transactions
    .filter((t) => t.type === 'expense')
    .forEach((tx) => {
      const cat = tx.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
    });

  const labels = Object.keys(categoryMap);
  const data = Object.values(categoryMap);

  if (!labels.length) {
    return { labels: ['Marketing', 'Rent', 'Utilities', 'Payroll'], data: [15000, 25000, 8500, 45000] };
  }

  return { labels, data };
}

/* ---------------- Render Functions ---------------- */

function render() {
  const userNameEl = document.getElementById('userName');
  if (userNameEl) userNameEl.textContent = state.user.name || 'MSME Owner';

  applyTheme(state.settings.theme);

  const notifToggle = document.getElementById('notifToggle');
  const voiceToggle = document.getElementById('voiceAssistToggle');
  const gstToggle = document.getElementById('gstToggle');

  if (notifToggle) notifToggle.checked = state.settings.notifications;
  if (voiceToggle) voiceToggle.checked = state.settings.voice;
  if (gstToggle) gstToggle.checked = state.settings.gstReminder;

  const goalInput = document.getElementById('goalInput');
  const budgetInput = document.getElementById('budgetInput');
  const profitTargetInput = document.getElementById('profitTargetInput');
  const savingsTargetInput = document.getElementById('savingsTargetInput');

  if (goalInput) goalInput.value = state.goal.target;
  if (budgetInput) budgetInput.value = state.plan.monthlyBudget;
  if (profitTargetInput) profitTargetInput.value = state.plan.targetProfit;
  if (savingsTargetInput) savingsTargetInput.value = state.plan.savingsGoal;

  // Set default date inputs
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('date');
  const invDate = document.getElementById('invDate');
  const partyDueDate = document.getElementById('partyDueDate');

  if (dateInput && !dateInput.value) dateInput.value = today;
  if (invDate && !invDate.value) invDate.value = today;
  if (partyDueDate && !partyDueDate.value) partyDueDate.value = today;

  renderSummary();
  renderTransactions();
  renderAlerts();
  renderRecommendations();
  renderCharts();
  renderHealthScore();
  renderInvoices();
  renderKhataLedger();
  renderGstCalculator();
  renderReports();
  renderBudgetPlanner();
  updateGoalProgress();
}

function renderSummary() {
  const { income, expenses, profit, cashReserve, runwayMonths } = getAggregates();

  const revEl = document.getElementById('revenueValue');
  const expEl = document.getElementById('expenseValue');
  const profEl = document.getElementById('profitValue');
  const cashEl = document.getElementById('cashValue');
  const runwayEl = document.getElementById('runwayValue');

  if (revEl) revEl.textContent = `₹${income.toLocaleString()}`;
  if (expEl) expEl.textContent = `₹${expenses.toLocaleString()}`;
  if (profEl) profEl.textContent = `₹${profit.toLocaleString()}`;
  if (cashEl) cashEl.textContent = `₹${cashReserve.toLocaleString()}`;
  if (runwayEl) runwayEl.textContent = `Est. Cash Runway: ${runwayMonths} Months`;

  // Update current goal savings progress dynamically
  state.goal.current = Math.max(0, profit);
}

function renderTransactions() {
  const list = document.getElementById('transactionsList');
  if (!list) return;

  const searchQuery = (document.getElementById('searchTransactions')?.value || '').toLowerCase().trim();

  let filtered = state.transactions.filter((tx) => {
    if (activeTxFilter === 'income' && tx.type !== 'income') return false;
    if (activeTxFilter === 'expense' && tx.type !== 'expense') return false;
    if (searchQuery) {
      const matchDesc = tx.description.toLowerCase().includes(searchQuery);
      const matchCat = tx.category.toLowerCase().includes(searchQuery);
      return matchDesc || matchCat;
    }
    return true;
  });

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!filtered.length) {
    list.innerHTML = `
      <div class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p>No matching transactions found.</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered
    .map(
      (entry) => `
    <div class="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl ${
          entry.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
        }">
          ${entry.type === 'income' ? '↙' : '↗'}
        </span>
        <div>
          <p class="font-semibold text-slate-900 dark:text-white">${entry.description}</p>
          <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span class="rounded-full bg-slate-100 px-2 py-0.5 font-medium dark:bg-slate-800">${entry.category}</span>
            <span>• ${entry.date}</span>
          </div>
        </div>
      </div>
      <div class="text-right">
        <p class="font-bold ${entry.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
          ${entry.type === 'income' ? '+' : '-'}₹${entry.amount.toLocaleString()}
        </p>
        <div class="mt-1 flex justify-end gap-2 text-xs">
          <button class="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium" onclick="editTransaction(${entry.id})">Edit</button>
          <button class="text-slate-400 hover:text-rose-600 font-medium" onclick="deleteTransaction(${entry.id})">Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((entry) => entry.id !== id);
  saveState();
  render();
}

function editTransaction(id) {
  const entry = state.transactions.find((item) => item.id === id);
  if (!entry) return;

  editingId = id;
  document.getElementById('type').value = entry.type;
  document.getElementById('category').value = entry.category;
  document.getElementById('amount').value = entry.amount;
  document.getElementById('description').value = entry.description;
  document.getElementById('date').value = entry.date;

  document.getElementById('saveTransactionBtn').textContent = 'Update Entry';
  document.getElementById('cancelEditBtn')?.classList.remove('hidden');

  showSection('tracker');
  document.getElementById('category').focus();
}

function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const monthlyData = getMonthlyData();
  const catData = getCategoryExpensesData();
  const { cashReserve } = getAggregates();

  // 1. Monthly Bar Chart
  const monthlyCtx = document.getElementById('monthlyChart')?.getContext('2d');
  if (monthlyCtx) {
    if (monthlyChart) monthlyChart.destroy();
    monthlyChart = new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: monthlyData.labels,
        datasets: [
          { label: 'Revenue', data: monthlyData.revenue, backgroundColor: '#10b981', borderRadius: 8 },
          { label: 'Expenses', data: monthlyData.expenses, backgroundColor: '#f43f5e', borderRadius: 8 },
          { label: 'Profit', data: monthlyData.profit, backgroundColor: '#3b82f6', borderRadius: 8 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(226, 232, 240, 0.5)' } } },
      },
    });
  }

  // 2. Flow Line Chart
  const flowCtx = document.getElementById('flowChart')?.getContext('2d');
  if (flowCtx) {
    if (flowChart) flowChart.destroy();
    const flowTrend = monthlyData.profit.map((p, idx) => Math.max(10000, 40000 + p * (idx + 1) * 0.4));
    flowChart = new Chart(flowCtx, {
      type: 'line',
      data: {
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Cash Flow Projection',
            data: flowTrend,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(226, 232, 240, 0.5)' } } },
      },
    });
  }

  // 3. Category Expense Doughnut Chart
  const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
  if (categoryCtx) {
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: catData.labels,
        datasets: [
          {
            data: catData.data,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
        cutout: '65%',
      },
    });
  }
}

function renderHealthScore() {
  const { income, expenses, profit, cashReserve } = getAggregates();

  // Multi-factor Health Calculation
  const profitMarginPct = income > 0 ? (profit / income) * 100 : 0;
  const expenseRatioPct = income > 0 ? (expenses / income) * 100 : 100;
  const runwayMonths = cashReserve / (expenses > 0 ? expenses / 3 : 25000);

  let score = 50;
  if (profitMarginPct >= 25) score += 25;
  else if (profitMarginPct > 10) score += 15;
  else if (profitMarginPct > 0) score += 5;

  if (expenseRatioPct <= 60) score += 20;
  else if (expenseRatioPct <= 80) score += 10;

  if (runwayMonths >= 3) score += 15;
  else if (runwayMonths >= 1.5) score += 8;

  score = Math.min(100, Math.max(15, Math.round(score)));

  const scoreEl = document.getElementById('scoreValue');
  if (scoreEl) scoreEl.textContent = score;

  // SVG Gauge Ring calculation (Circumference ~ 263.89)
  const ring = document.getElementById('scoreRing');
  if (ring) {
    const offset = 263.89 - (263.89 * score) / 100;
    ring.style.strokeDashoffset = offset;
  }

  const badge = document.getElementById('healthBadge');
  const summary = document.getElementById('healthSummaryText');

  if (score >= 80) {
    if (badge) badge.className = 'mt-4 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
    if (badge) badge.textContent = 'Excellent Health';
    if (summary) summary.textContent = `Robust profit margin (${profitMarginPct.toFixed(1)}%) & healthy cash buffer.`;
  } else if (score >= 60) {
    if (badge) badge.className = 'mt-4 rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-400';
    if (badge) badge.textContent = 'Stable Performance';
    if (summary) summary.textContent = `Controlled expenses, but target a higher liquidity reserve buffer.`;
  } else {
    if (badge) badge.className = 'mt-4 rounded-full bg-amber-100 px-4 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-400';
    if (badge) badge.textContent = 'Action Required';
    if (summary) summary.textContent = `High expense ratio (${expenseRatioPct.toFixed(1)}%). Focus on invoice collections.`;
  }

  const factorsEl = document.getElementById('healthFactors');
  if (!factorsEl) return;

  const factors = [
    {
      label: 'Profit Margin',
      value: `${profitMarginPct.toFixed(1)}%`,
      status: profitMarginPct > 15 ? 'Strong' : 'Moderate',
      extra: 'Net earnings percentage relative to total revenue.',
    },
    {
      label: 'Expense Efficiency Ratio',
      value: `${expenseRatioPct.toFixed(1)}%`,
      status: expenseRatioPct < 70 ? 'Healthy' : 'High',
      extra: 'Proportion of income consumed by operating expenditures.',
    },
    {
      label: 'Cash Runway Buffer',
      value: `${runwayMonths.toFixed(1)} Months`,
      status: runwayMonths >= 2 ? 'Optimal' : 'Low Buffer',
      extra: 'Duration business can operate smoothly at current expense burn rate.',
    },
  ];

  factorsEl.innerHTML = factors
    .map(
      (f) => `
    <div class="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-900 dark:text-white text-sm">${f.label}</span>
        <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold dark:bg-slate-800 ${
          f.status === 'Strong' || f.status === 'Healthy' || f.status === 'Optimal' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'
        }">${f.status} (${f.value})</span>
      </div>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${f.extra}</p>
    </div>
  `
    )
    .join('');
}

function renderAlerts() {
  const alertsList = document.getElementById('alertsList');
  if (!alertsList) return;

  const alerts = [];
  const { cashReserve, profit } = getAggregates();

  const overdueParties = state.parties.filter((p) => p.type === 'receivable' && p.status === 'Pending');
  const payables = state.parties.filter((p) => p.type === 'payable' && p.status === 'Pending');

  if (overdueParties.length) {
    alerts.push(`📅 Pending Customer Collections: ${overdueParties.length} parties owe total ₹${overdueParties.reduce((s, p) => s + p.amount, 0).toLocaleString()}.`);
  }
  if (payables.length) {
    alerts.push(`💸 Vendor Payables: ₹${payables.reduce((s, p) => s + p.amount, 0).toLocaleString()} due for suppliers.`);
  }
  if (state.settings.gstReminder) {
    alerts.push('🔔 Quarterly GST Filing due date approaching in 10 days.');
  }
  if (cashReserve < 50000) {
    alerts.push('⚠️ Cash reserve below recommended ₹50,000 threshold.');
  }

  if (!alerts.length) alerts.push('✅ All accounts & tax reminders are up to date.');

  alertsList.innerHTML = alerts
    .map((item) => `<li class="rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-800/60 font-medium text-xs text-slate-700 dark:text-slate-200">${item}</li>`)
    .join('');
}

function renderRecommendations() {
  const list = document.getElementById('recommendationsList');
  if (!list) return;

  const catData = getCategoryExpensesData();
  let maxExpenseCat = 'Marketing';
  let maxExpenseAmt = 0;

  if (catData.labels.length) {
    const maxIdx = catData.data.indexOf(Math.max(...catData.data));
    maxExpenseCat = catData.labels[maxIdx];
    maxExpenseAmt = catData.data[maxIdx];
  }

  const recommendations = [
    `Optimize spending on ${maxExpenseCat} (currently highest outflow at ₹${maxExpenseAmt.toLocaleString()}).`,
    'Send invoice reminders to overdue parties in Khata Ledger to boost cash flow reserve by ~15%.',
    'Claim full Input Tax Credit (ITC) on all raw material purchase invoices before filing GST.',
  ];

  list.innerHTML = recommendations
    .map((item) => `<li class="rounded-2xl bg-emerald-50/80 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">${item}</li>`)
    .join('');
}

/* ---------------- Invoices Feature ---------------- */

function handleCreateInvoice(event) {
  event.preventDefault();
  const client = document.getElementById('invClient').value.trim();
  const number = document.getElementById('invNumber').value.trim();
  const date = document.getElementById('invDate').value;
  const item = document.getElementById('invItem').value.trim();
  const qty = Number(document.getElementById('invQty').value);
  const rate = Number(document.getElementById('invRate').value);
  const gstRate = Number(document.getElementById('invGstRate').value);

  const subtotal = qty * rate;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;

  const newInv = { id: Date.now(), number, client, date, item, qty, rate, gstRate, subtotal, gstAmount, total };
  state.invoices.unshift(newInv);
  saveState();
  renderInvoices();
}

function renderInvoices() {
  const latest = state.invoices[0];
  if (!latest) return;

  document.getElementById('prevInvNum').textContent = latest.number;
  document.getElementById('prevInvDate').textContent = `Date: ${latest.date}`;
  document.getElementById('prevClient').textContent = latest.client;
  document.getElementById('prevItem').textContent = latest.item;
  document.getElementById('prevQty').textContent = latest.qty;
  document.getElementById('prevRate').textContent = `₹${latest.rate.toLocaleString()}`;
  document.getElementById('prevSubtotal').textContent = `₹${latest.subtotal.toLocaleString()}`;
  document.getElementById('prevSub').textContent = `₹${latest.subtotal.toLocaleString()}`;
  document.getElementById('prevGstPct').textContent = latest.gstRate;
  document.getElementById('prevGstAmt').textContent = `₹${latest.gstAmount.toLocaleString()}`;
  document.getElementById('prevGrandTotal').textContent = `₹${latest.total.toLocaleString()}`;
}

/* ---------------- Khata Ledger Feature ---------------- */

function handleAddParty(event) {
  event.preventDefault();
  const name = document.getElementById('partyName').value.trim();
  const type = document.getElementById('partyType').value;
  const amount = Number(document.getElementById('partyAmount').value);
  const dueDate = document.getElementById('partyDueDate').value;

  state.parties.unshift({ id: Date.now(), name, type, amount, dueDate, status: 'Pending' });
  saveState();
  document.getElementById('partyForm').reset();
  document.getElementById('partyDueDate').value = new Date().toISOString().split('T')[0];
  renderKhataLedger();
}

function renderKhataLedger() {
  const list = document.getElementById('partiesList');
  const totRecEl = document.getElementById('totalReceivable');
  const totPayEl = document.getElementById('totalPayable');

  const totalReceivable = state.parties.filter((p) => p.type === 'receivable' && p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPayable = state.parties.filter((p) => p.type === 'payable' && p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  if (totRecEl) totRecEl.textContent = `₹${totalReceivable.toLocaleString()}`;
  if (totPayEl) totPayEl.textContent = `₹${totalPayable.toLocaleString()}`;

  if (!list) return;

  if (!state.parties.length) {
    list.innerHTML = '<p class="text-xs text-slate-500">No parties added to ledger yet.</p>';
    return;
  }

  list.innerHTML = state.parties
    .map(
      (p) => `
    <div class="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3.5 text-xs dark:border-slate-800">
      <div>
        <p class="font-bold text-slate-900 dark:text-white">${p.name}</p>
        <p class="text-slate-500 dark:text-slate-400">Due Date: ${p.dueDate}</p>
      </div>
      <div class="text-right">
        <p class="font-extrabold ${p.type === 'receivable' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
          ${p.type === 'receivable' ? 'Receivable' : 'Payable'}: ₹${p.amount.toLocaleString()}
        </p>
        <button class="mt-1 text-[11px] text-slate-400 hover:text-emerald-600 font-medium" onclick="togglePartyStatus(${p.id})">
          ${p.status === 'Pending' ? 'Mark Settled' : '✓ Settled'}
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

function togglePartyStatus(id) {
  state.parties = state.parties.map((p) => (p.id === id ? { ...p, status: p.status === 'Pending' ? 'Settled' : 'Pending' } : p));
  saveState();
  renderKhataLedger();
  renderAlerts();
}

/* ---------------- GST Estimator Feature ---------------- */

function handleCalculateGst() {
  const { income, expenses } = getAggregates();
  const salesVal = Number(document.getElementById('gstSales').value) || income;
  const purchaseVal = Number(document.getElementById('gstPurchases').value) || expenses;
  const slabRate = Number(document.getElementById('gstSlab').value) || 18;

  const outputGst = (salesVal * slabRate) / 100;
  const itcGst = (purchaseVal * slabRate) / 100;
  const netGstPayable = Math.max(0, outputGst - itcGst);

  document.getElementById('gstOutputAmt').textContent = `₹${outputGst.toLocaleString()}`;
  document.getElementById('gstItcAmt').textContent = `₹${itcGst.toLocaleString()}`;
  document.getElementById('gstNetPayable').textContent = `₹${netGstPayable.toLocaleString()}`;
  document.getElementById('gstCgst').textContent = `₹${(netGstPayable / 2).toLocaleString()}`;
  document.getElementById('gstSgst').textContent = `₹${(netGstPayable / 2).toLocaleString()}`;
}

function renderGstCalculator() {
  handleCalculateGst();
}

/* ---------------- Reports & Export ---------------- */

function renderReports() {
  const summaryEl = document.getElementById('reportSummary');
  if (!summaryEl) return;

  const { income, expenses, profit, cashReserve } = getAggregates();

  summaryEl.innerHTML = `
    <div class="rounded-2xl bg-slate-100/70 p-3.5 dark:bg-slate-800/70"><strong>Total Income:</strong> ₹${income.toLocaleString()}</div>
    <div class="rounded-2xl bg-slate-100/70 p-3.5 dark:bg-slate-800/70"><strong>Total Operating Expenses:</strong> ₹${expenses.toLocaleString()}</div>
    <div class="rounded-2xl bg-emerald-50 p-3.5 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold"><strong>Net Business Profit:</strong> ₹${profit.toLocaleString()}</div>
    <div class="rounded-2xl bg-amber-50 p-3.5 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold"><strong>Estimated Liquidity Buffer:</strong> ₹${cashReserve.toLocaleString()}</div>
  `;
}

function exportToExcel() {
  const rows = [
    ['ID', 'Type', 'Category', 'Amount', 'Description', 'Date'],
    ...state.transactions.map((entry) => [
      entry.id,
      entry.type,
      `"${entry.category.replace(/"/g, '""')}"`,
      entry.amount,
      `"${entry.description.replace(/"/g, '""')}"`,
      entry.date,
    ]),
  ];
  const csvContent = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `MSME_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

/* ---------------- Settings & Goal Planner ---------------- */

function renderBudgetPlanner() {
  const summary = document.getElementById('budgetPlanSummary');
  if (!summary) return;

  const { income, expenses, profit } = getAggregates();
  const remainingBudget = state.plan.monthlyBudget - expenses;
  const gapToSavings = state.plan.savingsGoal - Math.max(0, profit);

  summary.innerHTML = `
    <p><strong>Monthly Expense Cap:</strong> ₹${state.plan.monthlyBudget.toLocaleString()}</p>
    <p><strong>Target Net Profit:</strong> ₹${state.plan.targetProfit.toLocaleString()}</p>
    <p><strong>Current Net Profit:</strong> ₹${profit.toLocaleString()}</p>
    <p><strong>Remaining Expense Allowance:</strong> ₹${remainingBudget.toLocaleString()}</p>
    <p class="mt-2 text-xs font-semibold ${remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
      ${remainingBudget >= 0 ? '✓ Operating within planned expense budget.' : '⚠️ Expenditures have exceeded monthly budget cap.'}
    </p>
  `;
}

function updateGoalProgress() {
  const goalBar = document.getElementById('sidebarGoalBar');
  const goalText = document.getElementById('sidebarGoalText');
  const goalTarget = document.getElementById('sidebarGoalTarget');
  const goalStatus = document.getElementById('goalStatus');

  const { profit } = getAggregates();
  const current = Math.max(0, profit);
  const percent = Math.min(100, Math.round((current / (state.goal.target || 50000)) * 100));

  if (goalBar) goalBar.style.width = `${percent}%`;
  if (goalText) goalText.textContent = `₹${current.toLocaleString()}`;
  if (goalTarget) goalTarget.textContent = `/ ₹${state.goal.target.toLocaleString()}`;

  if (goalStatus) {
    goalStatus.textContent = `Monthly Target: ₹${state.goal.target.toLocaleString()} • Goal Achieved: ${percent}%`;
  }
}

/* ---------------- AI Assistant ---------------- */

function sendAssistantReply() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  const messages = document.getElementById('chatMessages');
  if (!messages) return;

  const userBubble = `<div class="rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs">${message}</div>`;
  const replyText = getAssistantReply(message);
  const assistantBubble = `<div class="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs">${replyText}</div>`;

  messages.insertAdjacentHTML('beforeend', userBubble + assistantBubble);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  if (state.settings.voice && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(replyText.replace(/[\u{1F600}-\u{1F64F}]/gu, ''));
    window.speechSynthesis.speak(utterance);
  }
}

function getAssistantReply(message) {
  const lower = message.toLowerCase();
  const { income, expenses, profit, cashReserve, runwayMonths } = getAggregates();

  if (lower.includes('cash') || lower.includes('reserve') || lower.includes('runway')) {
    return `Your estimated cash flow reserve is ₹${cashReserve.toLocaleString()}, giving you a cash runway buffer of approximately ${runwayMonths} months at current burn rate.`;
  }
  if (lower.includes('expense') || lower.includes('reduce') || lower.includes('cost')) {
    return `Total expenses tracked stand at ₹${expenses.toLocaleString()}. Check the Category Breakdown chart in Analytics to target top cost drivers like Rent or Payroll.`;
  }
  if (lower.includes('gst') || lower.includes('tax')) {
    return `Use the GST Estimator section to calculate CGST & SGST. Remember to collect valid GSTIN purchase invoices to claim Input Tax Credit!`;
  }
  if (lower.includes('profit') || lower.includes('margin') || lower.includes('summary')) {
    return `Your business has earned ₹${income.toLocaleString()} total revenue against ₹${expenses.toLocaleString()} expenses, resulting in a net profit of ₹${profit.toLocaleString()}.`;
  }

  return `Based on your live metrics: Revenue = ₹${income.toLocaleString()}, Expenses = ₹${expenses.toLocaleString()}, Net Profit = ₹${profit.toLocaleString()}. I recommend monitoring receivables and keeping a 60-day cash buffer!`;
}

/* ---------------- Speech Recognition ---------------- */

function toggleVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice recognition is not available in this browser.');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      handleVoiceCommand(command);
    };
  }

  recognition.start();
  const voiceToggle = document.getElementById('voiceToggle');
  if (voiceToggle) voiceToggle.textContent = '🎤 Listening...';

  recognition.onend = () => {
    if (voiceToggle) voiceToggle.innerHTML = '<span id="voiceIcon">🎤</span> Voice';
  };
}

function handleVoiceCommand(command) {
  const text = command.toLowerCase();
  if (text.includes('dashboard')) showSection('dashboard');
  else if (text.includes('tracker')) showSection('tracker');
  else if (text.includes('analytics')) showSection('analytics');
  else if (text.includes('health')) showSection('health');
  else if (text.includes('invoice')) showSection('invoices');
  else if (text.includes('khata') || text.includes('ledger')) showSection('khata');
  else if (text.includes('gst') || text.includes('tax')) showSection('gst');
  else if (text.includes('report')) showSection('reports');
  else if (text.includes('setting')) showSection('settings');

  if (text.includes('dark')) {
    state.settings.theme = 'dark';
    applyTheme('dark');
    saveState();
  } else if (text.includes('light')) {
    state.settings.theme = 'light';
    applyTheme('light');
    saveState();
  }
}

/* ---------------- Initialization ---------------- */

function init() {
  loadState();
  attachEvents();
  syncAuthUI();
  render();
  showSection('dashboard');
  hideLoadingScreen();
}

window.addEventListener('DOMContentLoaded', init);
