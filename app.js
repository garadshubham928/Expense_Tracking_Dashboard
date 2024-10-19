let totalIncome = 0;
let expenses = [];
let editIndex = null;

// Load transactions from localStorage on page load
function loadTransactions() {
    const storedIncome = localStorage.getItem('totalIncome');
    const storedExpenses = localStorage.getItem('expenses');
    if (storedIncome) {
        totalIncome = parseFloat(storedIncome);
    }
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
    }
    renderTransactions(); // Render transactions if on the main page
}

// Render transactions in the table
function renderTransactions() {
    const transactionTableBody = document.querySelector('#transaction-table tbody');
    if (!transactionTableBody) return; // Exit if the element does not exist

    transactionTableBody.innerHTML = '';

    expenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.text}</td>
            <td>${expense.category}</td>
            <td>${expense.amount.toFixed(2)}</td>
            <td><button onclick="editTransaction(${index})">Edit</button></td>
            <td><button onclick="deleteTransaction(${index})">Delete</button></td>
        `;
        transactionTableBody.appendChild(row);
    });
}

// Save total income to localStorage
document.getElementById('income-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    totalIncome = parseFloat(document.getElementById('total-income').value);
    localStorage.setItem('totalIncome', totalIncome);
    alert('Income saved successfully!');
});

// Handle expense form submission
document.getElementById('expense-form')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const expenseText = document.getElementById('expense-text').value;
    const expenseCategory = document.getElementById('expense-category').value;
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);

    const newExpense = { text: expenseText, category: expenseCategory, amount: expenseAmount };

    // Check if we are editing an existing transaction or adding a new one
    if (editIndex !== null) {
        expenses[editIndex] = newExpense; // Update the existing expense
        editIndex = null; // Reset edit index
    } else {
        expenses.push(newExpense); // Add a new expense
    }

    // Save the updated expenses array to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderTransactions(); // Re-render the transactions
    clearExpenseForm(); // Clear the form inputs
});

// Edit transaction
function editTransaction(index) {
    const expense = expenses[index];
    document.getElementById('expense-text').value = expense.text;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-amount').value = expense.amount;
    editIndex = index; // Set edit index for updating later
}

// Delete transaction
function deleteTransaction(index) {
    expenses.splice(index, 1); // Remove the expense at the specified index
    localStorage.setItem('expenses', JSON.stringify(expenses)); // Update localStorage
    renderTransactions(); // Re-render the transactions
}

// Clear the expense form
function clearExpenseForm() {
    document.getElementById('expense-text').value = '';
    document.getElementById('expense-category').value = 'Food'; // Reset category to default
    document.getElementById('expense-amount').value = '';
}

// Load transactions on page load
loadTransactions();

// Check if we're on the dashboard page and load transaction summary
if (window.location.pathname.endsWith("dashboard.html")) {
    loadTransactionSummary();
}

// Load transaction summary for dashboard
function loadTransactionSummary() {
    const categoryData = {};
    expenses.forEach(expense => {
        categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    
    // Update the charts
    renderCharts(categoryData, totalIncome, totalExpenses);
}

// Render charts in the dashboard
function renderCharts(categoryData, totalIncome, totalExpenses) {
    const categoryChartCtx = document.getElementById('categoryChart').getContext('2d');
    const incomeExpenseChartCtx = document.getElementById('incomeExpenseChart').getContext('2d');

    // Render category pie chart
    const categoryLabels = Object.keys(categoryData);
    const categoryValues = Object.values(categoryData);

    new Chart(categoryChartCtx, {
        type: 'pie',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryValues,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#cc65fe', '#ff9f40'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expenses by Category'
                }
            }
        }
    });

    // Render income vs expenses bar chart
    new Chart(incomeExpenseChartCtx, {
        type: 'bar',
        data: {
            labels: ['Total Income', 'Total Expenses'],
            datasets: [{
                label: 'Amount',
                data: [totalIncome, totalExpenses],
                backgroundColor: ['#36a2eb', '#ff6384'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Income vs Expenses'
                }
            }
        }
    });
}
