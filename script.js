const defaultState = {
  user: { name: 'Asha Sharma', email: 'asha@coastalcrafts.in' },
  users: [
    { name: 'Asha Sharma', email: 'asha@coastalcrafts.in', password: 'demo123' },
  ],
  transactions: [
    { id: 1, type: 'income', category: 'Sales', amount: 120000, description: 'Invoice #101', date: '2026-06-15' },
    { id: 2, type: 'expense', category: 'Marketing', amount: 18000, description: 'Google ads', date: '2026-06-16' },
    { id: 3, type: 'income', category: 'Services', amount: 65000, description: 'Consulting', date: '2026-06-18' },
    { id: 4, type: 'expense', category: 'Rent', amount: 25000, description: 'Office rent', date: '2026-06-20' },
    { id: 5, type: 'income', category: 'Sales', amount: 95000, description: 'Invoice #102', date: '2026-06-24' },
    { id: 6, type: 'expense', category: 'Utilities', amount: 9000, description: 'Electricity', date: '2026-06-26' },
  ],
  settings: { theme: 'light', notifications: true, voice: true, gstReminder: true },
  goal: { target: 50000, current: 34000 },
  plan: { monthlyBudget: 500000, targetProfit: 180000, savingsGoal: 50000 },
};

let state = null;
let monthlyChart;
let flowChart;
let categoryChart;
let recognition;
let isSidebarOpen = false;
let editingId = null;

function loadState() {
  const saved = localStorage.getItem('msmeFinanceState');
  if (saved) {
    const parsed = JSON.parse(saved);
    state = { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...(parsed.settings || {}) }, goal: { ...defaultState.goal, ...(parsed.goal || {}) }, transactions: parsed.transactions || defaultState.transactions };
  } else {
    state = JSON.parse(JSON.stringify(defaultState));
    localStorage.setItem('msmeFinanceState', JSON.stringify(state));
  }
}

function saveState() {
  localStorage.setItem('msmeFinanceState', JSON.stringify(state));
}

function attachEvents() {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');

  const showSigninBtn = document.getElementById('showSigninBtn');
  const showSignupBtn = document.getElementById('showSignupBtn');
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');
  const logoutBtn = document.getElementById('logoutBtn');

  showSigninBtn?.addEventListener('click', () => toggleAuthMode('signin'));
  showSignupBtn?.addEventListener('click', () => toggleAuthMode('signup'));
  signinForm?.addEventListener('submit', handleSignin);
  signupForm?.addEventListener('submit', handleSignup);
  logoutBtn?.addEventListener('click', handleLogout);

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      isSidebarOpen = !isSidebarOpen;
      sidebar.classList.toggle('open', isSidebarOpen);
      menuToggle.setAttribute('aria-expanded', String(isSidebarOpen));
    });
  }

  document.getElementById('loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('loginOverlay')?.classList.add('hidden');
    document.getElementById('appShell')?.classList.remove('hidden');
    state.user.name = document.getElementById('email')?.value.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || state.user.name;
    saveState();
    render();
  });

  document.querySelectorAll('.nav-link').forEach((button) => {
    button.addEventListener('click', () => {
      const section = button.dataset.section;
      showSection(section);
      document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('bg-emerald-50', 'text-emerald-700', 'dark:bg-slate-800'));
      button.classList.add('bg-emerald-50', 'text-emerald-700', 'dark:bg-slate-800');
      if (window.innerWidth < 1024 && sidebar) {
        isSidebarOpen = false;
        sidebar.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    const nextTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    state.settings.theme = nextTheme;
    applyTheme(nextTheme);
    saveState();
  });

  document.getElementById('transactionForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      id: editingId || Date.now(),
      type: document.getElementById('type').value,
      category: document.getElementById('category').value || 'General',
      amount: Number(document.getElementById('amount').value),
      description: document.getElementById('description').value || 'Added entry',
      date: document.getElementById('date').value || new Date().toISOString().split('T')[0],
    };
    if (editingId) {
      state.transactions = state.transactions.map((item) => (item.id === editingId ? { ...item, ...data } : item));
      editingId = null;
    } else {
      state.transactions.unshift(data);
    }
    saveState();
    event.target.reset();
    render();
  });

  document.getElementById('assistantToggle').addEventListener('click', () => {
    document.getElementById('assistantPanel').classList.toggle('hidden');
  });

  document.getElementById('closeAssistant').addEventListener('click', () => {
    document.getElementById('assistantPanel').classList.add('hidden');
  });

  document.getElementById('sendChat').addEventListener('click', sendAssistantReply);
  document.getElementById('chatInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendAssistantReply();
  });

  document.getElementById('voiceToggle').addEventListener('click', toggleVoiceRecognition);
  document.getElementById('notifToggle').addEventListener('change', (event) => {
    state.settings.notifications = event.target.checked;
    saveState();
  });
  document.getElementById('voiceAssistToggle').addEventListener('change', (event) => {
    state.settings.voice = event.target.checked;
    saveState();
  });
  document.getElementById('gstToggle').addEventListener('change', (event) => {
    state.settings.gstReminder = event.target.checked;
    saveState();
  });
  document.getElementById('saveGoalBtn').addEventListener('click', () => {
    const value = Number(document.getElementById('goalInput').value || 50000);
    state.goal.target = value;
    saveState();
    render();
  });
  document.getElementById('budgetForm').addEventListener('submit', (event) => {
    event.preventDefault();
    state.plan.monthlyBudget = Number(document.getElementById('budgetInput').value || state.plan.monthlyBudget);
    state.plan.targetProfit = Number(document.getElementById('profitTargetInput').value || state.plan.targetProfit);
    state.plan.savingsGoal = Number(document.getElementById('savingsTargetInput').value || state.plan.savingsGoal);
    saveState();
    render();
  });
  document.getElementById('pdfExport').addEventListener('click', () => {
    window.print();
  });
  document.getElementById('excelExport').addEventListener('click', exportToExcel);
}

function showSection(section) {
  document.querySelectorAll('.section').forEach((panel) => panel.classList.add('hidden'));
  const activeSection = document.getElementById(section);
  if (activeSection) {
    activeSection.classList.remove('hidden');
    activeSection.setAttribute('tabindex', '-1');
    activeSection.focus({ preventScroll: true });
  }
}

function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  document.body.classList.toggle('light-theme', theme === 'light');
  document.documentElement.style.colorScheme = theme;
}

function render() {
  document.getElementById('userName').textContent = state.user.name;
  applyTheme(state.settings.theme);
  document.getElementById('notifToggle').checked = state.settings.notifications;
  document.getElementById('voiceAssistToggle').checked = state.settings.voice;
  document.getElementById('gstToggle').checked = state.settings.gstReminder;
  document.getElementById('goalInput').value = state.goal.target;
  document.getElementById('budgetInput').value = state.plan.monthlyBudget;
  document.getElementById('profitTargetInput').value = state.plan.targetProfit;
  document.getElementById('savingsTargetInput').value = state.plan.savingsGoal;
  renderSummary();
  renderTransactions();
  renderAlerts();
  renderRecommendations();
  renderCharts();
  renderHealthScore();
  renderReports();
  renderSettingsStatus();
  renderBudgetPlanner();
  updateGoalProgress();
}

function getMonthlySummary() {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenue = [120000, 145000, 130000, 160000, 175000, 190000];
  const expenses = [80000, 92000, 88000, 95000, 102000, 111000];
  const profit = revenue.map((value, index) => value - expenses[index]);
  return { labels, revenue, expenses, profit };
}

function renderSummary() {
  const income = state.transactions.filter((t) => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = state.transactions.filter((t) => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const profit = income - expenses;
  const cashFlow = income - expenses + 35000;
  document.getElementById('revenueValue').textContent = `₹${income.toLocaleString()}`;
  document.getElementById('expenseValue').textContent = `₹${expenses.toLocaleString()}`;
  document.getElementById('profitValue').textContent = `₹${profit.toLocaleString()}`;
  document.getElementById('cashValue').textContent = `₹${cashFlow.toLocaleString()}`;
}

function renderAlerts() {
  const alerts = [];
  const balance = Number(document.getElementById('cashValue').textContent.replace(/[^0-9-]/g, ''));
  if (balance < 40000) alerts.push('⚠️ Low cash balance may affect payroll this week.');
  if (state.settings.notifications) alerts.push('🔔 Upcoming GST filing due in 5 days.');
  alerts.push('📅 Pending invoice reminder: 3 invoices overdue.');
  document.getElementById('alertsList').innerHTML = alerts.map((item) => `<li class="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800">${item}</li>`).join('');
}

function renderRecommendations() {
  const recommendations = [
    'Reduce marketing spend by 10% and reallocate to sales conversion.',
    'Your cash flow may become negative next month if collections slip.',
    'Settle overdue bills before the end of the week to protect liquidity.'
  ];
  document.getElementById('recommendationsList').innerHTML = recommendations.map((item) => `<li class="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">${item}</li>`).join('');
}

function renderTransactions() {
  const list = document.getElementById('transactionsList');
  const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!sorted.length) {
    list.innerHTML = '<p class="rounded-2xl border border-dashed border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No transactions yet. Add one to begin planning.</p>';
    return;
  }
  list.innerHTML = sorted.slice(0, 6).map((entry) => `
    <div class="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3 text-sm dark:border-slate-700">
      <div>
        <p class="font-medium">${entry.description}</p>
        <p class="text-slate-500 dark:text-slate-400">${entry.category} • ${entry.date}</p>
      </div>
      <div class="text-right">
        <p class="font-semibold ${entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}">${entry.type === 'income' ? '+' : '-'}₹${entry.amount.toLocaleString()}</p>
        <div class="mt-1 flex justify-end gap-2">
          <button class="text-xs text-slate-500" onclick="editTransaction(${entry.id})" aria-label="Edit transaction">Edit</button>
          <button class="text-xs text-slate-500" onclick="deleteTransaction(${entry.id})" aria-label="Delete transaction">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
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
  showSection('tracker');
  document.getElementById('category').focus();
}

function renderCharts() {
  const summary = getMonthlySummary();
  const monthlyCtx = document.getElementById('monthlyChart');
  if (!monthlyChart) {
    monthlyChart = new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: summary.labels,
        datasets: [
          { label: 'Revenue', data: summary.revenue, backgroundColor: '#34d399' },
          { label: 'Expenses', data: summary.expenses, backgroundColor: '#f59e0b' },
          { label: 'Profit', data: summary.profit, backgroundColor: '#60a5fa' },
        ],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  } else {
    monthlyChart.data.labels = summary.labels;
    monthlyChart.data.datasets[0].data = summary.revenue;
    monthlyChart.data.datasets[1].data = summary.expenses;
    monthlyChart.data.datasets[2].data = summary.profit;
    monthlyChart.update();
  }

  const flowCtx = document.getElementById('flowChart');
  if (!flowChart) {
    flowChart = new Chart(flowCtx, {
      type: 'line',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{ label: 'Cash Flow', data: [24000, 36000, 29000, 41000, 39000, 48000], borderColor: '#10b981', tension: 0.4, fill: true, backgroundColor: 'rgba(16,185,129,0.16)' }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  } else {
    flowChart.update();
  }

  const categoryCtx = document.getElementById('categoryChart');
  if (!categoryChart) {
    categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Marketing', 'Payroll', 'Utilities', 'Inventory'],
        datasets: [{ data: [30, 25, 15, 30], backgroundColor: ['#34d399', '#f59e0b', '#60a5fa', '#f472b6'] }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  }
}

function renderHealthScore() {
  const income = state.transactions.filter((t) => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = state.transactions.filter((t) => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const score = Math.min(100, 70 + Math.round((income - expenses) / 10000));
  document.getElementById('scoreValue').textContent = score;
  const factors = [
    { label: 'Liquidity', value: 'Strong', extra: 'Cash reserve is healthy.' },
    { label: 'Profitability', value: 'Solid', extra: 'Margins improved this month.' },
    { label: 'Liabilities', value: 'Moderate', extra: 'Overdue bills need attention.' },
  ];
  document.getElementById('healthFactors').innerHTML = factors.map((factor) => `
    <div class="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
      <div class="flex items-center justify-between">
        <span class="font-medium">${factor.label}</span>
        <span class="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">${factor.value}</span>
      </div>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${factor.extra}</p>
    </div>
  `).join('');
}

function renderReports() {
  const income = state.transactions.filter((t) => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = state.transactions.filter((t) => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  document.getElementById('reportSummary').innerHTML = `
    <div class="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><strong>Income:</strong> ₹${income.toLocaleString()}</div>
    <div class="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><strong>Expenses:</strong> ₹${expenses.toLocaleString()}</div>
    <div class="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><strong>Net:</strong> ₹${(income - expenses).toLocaleString()}</div>
  `;
}

function renderSettingsStatus() {
  const goalStatus = document.getElementById('goalStatus');
  const progress = Math.min(100, Math.round((state.goal.current / state.goal.target) * 100));
  goalStatus.innerHTML = `Current target: ₹${state.goal.target.toLocaleString()} • Progress ${progress}%`;
}

function renderBudgetPlanner() {
  const income = state.transactions.filter((t) => t.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenses = state.transactions.filter((t) => t.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = state.plan.monthlyBudget - expenses;
  const projectedProfit = income - expenses;
  const gapToSavings = state.plan.savingsGoal - Math.max(0, projectedProfit);
  const summary = document.getElementById('budgetPlanSummary');
  summary.innerHTML = `
    <p><strong>Budget:</strong> ₹${state.plan.monthlyBudget.toLocaleString()}</p>
    <p><strong>Planned profit target:</strong> ₹${state.plan.targetProfit.toLocaleString()}</p>
    <p><strong>Projected profit:</strong> ₹${projectedProfit.toLocaleString()}</p>
    <p><strong>Budget remaining:</strong> ₹${remainingBudget.toLocaleString()}</p>
    <p><strong>Savings gap:</strong> ₹${Math.max(0, gapToSavings).toLocaleString()}</p>
    <p class="mt-2 text-xs">${remainingBudget >= 0 ? 'You are within budget.' : 'Your spending has exceeded the planned budget.'}</p>
  `;
}

function updateGoalProgress() {
  const percent = Math.min(100, Math.round((state.goal.current / state.goal.target) * 100));
  document.getElementById('goalProgress').style.width = `${percent}%`;
  document.getElementById('goalText').textContent = `₹${state.goal.current.toLocaleString()} saved`;
}

function exportToExcel() {
  const rows = [
    ['Type', 'Category', 'Amount', 'Description', 'Date'],
    ...state.transactions.map((entry) => [entry.type, entry.category, entry.amount, entry.description, entry.date]),
  ];
  const csv = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'finance-report.csv';
  link.click();
}

function sendAssistantReply() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  const messages = document.getElementById('chatMessages');
  const userBubble = `<div class="rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">${message}</div>`;
  const assistantBubble = `<div class="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">${getAssistantReply(message)}</div>`;
  messages.insertAdjacentHTML('beforeend', userBubble + assistantBubble);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
}

function getAssistantReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('cash')) return 'Cash balance is healthy, but collections should improve before the end of the month.';
  if (lower.includes('expense')) return 'Marketing and rent are driving spend; consider trimming 10% from payroll ads.';
  if (lower.includes('report')) return 'Your current report shows positive net cash flow and a stable health rating.';
  return 'I recommend tightening recurring expenses, monitoring receivables, and keeping a 30-day buffer.';
}

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
  if (recognition.running) return;
  recognition.start();
  document.getElementById('voiceToggle').textContent = '🎤 Listening...';
  recognition.onend = () => {
    document.getElementById('voiceToggle').textContent = '🎤 Voice Commands';
  };
}

function handleVoiceCommand(command) {
  const text = command.toLowerCase();
  if (text.includes('dashboard')) showSection('dashboard');
  if (text.includes('tracker')) showSection('tracker');
  if (text.includes('analytics')) showSection('analytics');
  if (text.includes('score')) showSection('health');
  if (text.includes('report')) showSection('reports');
  if (text.includes('dark')) {
    state.settings.theme = 'dark';
    applyTheme('dark');
    saveState();
  }
  if (text.includes('light')) {
    state.settings.theme = 'light';
    applyTheme('light');
    saveState();
  }
}

function toggleAuthMode(mode) {
  document.getElementById('showSigninBtn').classList.toggle('bg-emerald-600', mode === 'signin');
  document.getElementById('showSigninBtn').classList.toggle('text-white', mode === 'signin');
  document.getElementById('showSignupBtn').classList.toggle('bg-emerald-600', mode === 'signup');
  document.getElementById('showSignupBtn').classList.toggle('text-white', mode === 'signup');
  document.getElementById('showSigninBtn').classList.toggle('text-slate-600', mode === 'signup');
  document.getElementById('showSignupBtn').classList.toggle('text-slate-600', mode === 'signin');
  document.getElementById('signinForm').classList.toggle('hidden', mode === 'signup');
  document.getElementById('signupForm').classList.toggle('hidden', mode === 'signin');
}

function handleSignin(event) {
  event.preventDefault();
  const email = document.getElementById('signinEmail').value.trim();
  const password = document.getElementById('signinPassword').value;
  const user = state.users.find((entry) => entry.email === email && entry.password === password);
  if (user) {
    state.user = { name: user.name, email: user.email };
    saveState();
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
    render();
  } else {
    document.getElementById('authMessage').textContent = 'Invalid email or password. Try demo account.';
  }
}

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  if (!name || !email || !password) {
    document.getElementById('authMessage').textContent = 'Please complete all fields.';
    return;
  }
  const exists = state.users.some((entry) => entry.email === email);
  if (exists) {
    document.getElementById('authMessage').textContent = 'An account with this email already exists.';
    return;
  }
  state.users.push({ name, email, password });
  state.user = { name, email };
  saveState();
  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  render();
}

function handleLogout() {
  state.user = { name: '', email: '' };
  saveState();
  syncAuthUI();
  document.getElementById('signinForm').reset();
  document.getElementById('signupForm').reset();
  document.getElementById('authMessage').textContent = '';
  toggleAuthMode('signin');
}

function syncAuthUI() {
  const overlay = document.getElementById('loginOverlay');
  const app = document.getElementById('appShell');
  const isAuthenticated = Boolean(state?.user?.email);
  overlay?.classList.toggle('hidden', isAuthenticated);
  app?.classList.toggle('hidden', !isAuthenticated);
}

function init() {
  loadState();
  attachEvents();
  syncAuthUI();
  render();
  showSection('dashboard');
  document.querySelector('.nav-link[data-section="dashboard"]').classList.add('bg-emerald-50', 'text-emerald-700', 'dark:bg-slate-800');
}

window.addEventListener('DOMContentLoaded', init);