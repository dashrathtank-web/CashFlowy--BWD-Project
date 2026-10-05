let transactions =
    JSON.parse(localStorage.getItem("cashflowyTransactions")) || [];

let currentType = "expense";


// Set today's date
document.getElementById("date").value =
    new Date().toISOString().split("T")[0];


// Transaction type buttons
document.querySelectorAll(".type-btn").forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll(".type-btn")
            .forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        currentType = this.dataset.type;

        document.getElementById("type").value = currentType;
    });

});


// Add transaction
document.getElementById("transactionForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();

        const amount =
            Number(document.getElementById("amount").value);

        const category =
            document.getElementById("category").value;

        const description =
            document.getElementById("description").value;

        const date =
            document.getElementById("date").value;

        if (!amount || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const transaction = {

            id: Date.now(),

            type: currentType,

            amount: amount,

            category: category,

            description: description,

            date: date

        };

        transactions.unshift(transaction);

        saveData();

        this.reset();

        document.getElementById("date").value =
            new Date().toISOString().split("T")[0];

        document.querySelectorAll(".type-btn")
            .forEach(btn => btn.classList.remove("active"));

        document.querySelector('[data-type="expense"]')
            .classList.add("active");

        currentType = "expense";

        updateDashboard();

    });


// Save data
function saveData() {

    localStorage.setItem(
        "cashflowyTransactions",
        JSON.stringify(transactions)
    );

}


// Update dashboard
function updateDashboard() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {

        if (t.type === "income") {

            totalIncome += t.amount;

        } else {

            totalExpense += t.amount;

        }

    });

    const balance = totalIncome - totalExpense;

    let savingRate = 0;

    if (totalIncome > 0) {

        savingRate =
            ((balance / totalIncome) * 100);

    }

    // Dashboard
    document.getElementById("balance").textContent =
        formatCurrency(balance);

    document.getElementById("income").textContent =
        formatCurrency(totalIncome);

    document.getElementById("expense").textContent =
        formatCurrency(totalExpense);

    document.getElementById("savingRate").textContent =
        Math.max(0, savingRate).toFixed(1) + "%";


    // Hero
    document.getElementById("heroBalance").textContent =
        formatCurrency(balance);

    document.getElementById("heroIncome").textContent =
        formatCurrency(totalIncome);

    document.getElementById("heroExpense").textContent =
        formatCurrency(totalExpense);


    renderTransactions();

    renderAnalytics(totalIncome, totalExpense);

}


// Format currency
function formatCurrency(value) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR",

        maximumFractionDigits: 0

    }).format(value);

}


// Render transactions
function renderTransactions() {

    const list =
        document.getElementById("transactionList");

    if (transactions.length === 0) {

        list.innerHTML =
            `<div class="empty">
                No transactions yet. Add your first transaction!
            </div>`;

        return;

    }

    list.innerHTML = "";

    transactions.forEach(t => {

        const div =
            document.createElement("div");

        div.className = "transaction";

        const icon =
            t.type === "income" ? "📈" : "📉";

        const amountClass =
            t.type === "income"
                ? "amount-income"
                : "amount-expense";

        const sign =
            t.type === "income" ? "+" : "-";

        div.innerHTML = `

            <div class="transaction-icon ${t.type}">
                ${icon}
            </div>

            <div class="transaction-info">
                <h4>${escapeHTML(t.description)}</h4>
                <small>
                    ${escapeHTML(t.category)}
                </small>
            </div>

            <div class="transaction-date">
                <small>${formatDate(t.date)}</small>
            </div>

            <div class="transaction-amount ${amountClass}">
                ${sign}${formatCurrency(t.amount)}
            </div>

            <button
                class="delete-btn"
                onclick="deleteTransaction(${t.id})">
                🗑️
            </button>

        `;

        list.appendChild(div);

    });

}


// Delete transaction
function deleteTransaction(id) {

    transactions =
        transactions.filter(t => t.id !== id);

    saveData();

    updateDashboard();

}


// Clear all
function clearTransactions() {

    if (transactions.length === 0) return;

    const confirmDelete =
        confirm("Delete all transactions?");

    if (!confirmDelete) return;

    transactions = [];

    saveData();

    updateDashboard();

}


// Analytics
function renderAnalytics(income, expense) {

    let percentage = 0;

    if (income > 0) {

        percentage =
            (expense / income) * 100;

    }

    percentage =
        Math.min(percentage, 100);

    document.getElementById("percentage")
        .textContent =
        percentage.toFixed(1) + "%";

    document.getElementById("progress")
        .style.width =
        percentage + "%";


    // Categories
    const categories = {};

    transactions
        .filter(t => t.type === "expense")
        .forEach(t => {

            if (!categories[t.category]) {

                categories[t.category] = 0;

            }

            categories[t.category] += t.amount;

        });


    const summary =
        document.getElementById("categorySummary");

    const categoryKeys =
        Object.keys(categories);

    if (categoryKeys.length === 0) {

        summary.innerHTML =
            "No spending data available.";

        return;

    }

    categoryKeys.sort(
        (a, b) => categories[b] - categories[a]
    );

    summary.innerHTML = "";

    categoryKeys.forEach(category => {

        const div =
            document.createElement("div");

        div.className = "category-item";

        div.innerHTML = `

            <span>${escapeHTML(category)}</span>

            <strong>
                ${formatCurrency(categories[category])}
            </strong>

        `;

        summary.appendChild(div);

    });

}


// Date formatting
function formatDate(date) {

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


// Prevent HTML injection
function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// Dark mode
function toggleTheme() {

    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "cashflowyDarkMode",
        dark
    );

}


// Load dark mode
if (
    localStorage.getItem("cashflowyDarkMode") === "true"
) {

    document.body.classList.add("dark");

}


// Initial dashboard
updateDashboard();