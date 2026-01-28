const form = document.getElementById("expense-form");
const titleIp= document.getElementById("title");
const amountIp = document.getElementById("amount");
const typeIp = document.getElementById("type");
const categoryIp = document.getElementById("category");
const transactionList = document.getElementById("transaction-list");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const balancee = document.getElementById("balance");
const chartCanvas = document.getElementById("expense-chart");

// loading transactions
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];



//adding transactions
form.addEventListener("submit",e =>{
    e.preventDefault();
    console.log("Form submitted!"); 
    const transaction = {
        id : Date.now(),
        title : titleIp.value,
        amount : Number(amountIp.value),
        type : typeIp.value,
        category : categoryIp.value
    };
    transactions.push(transaction);
    saveAndRender();
    form.reset();
});

//deleting a transaction
transactionList.addEventListener("click",e =>{
    if(e.target.classList.contains('delete-btn')){
        const id = +e.target.parentElement.dataset.id;
        transactions = transactions.filter(t => t.id !== id);
        saveAndRender();
    }
});

//saving and rendering
function saveAndRender(){
    localStorage.setItem("transactions",JSON.stringify(transactions));
    renderTransactions();
    updateTotals();
    renderChart();
    renderIncomeChart();
    renderCombinedChart();
}

//rendering transactions
function renderTransactions(){
    transactionList.innerHTML = "";
    transactions.forEach(t =>{
        const li =document.createElement("li");
        li.className = t.type;
        li.dataset.id = t.id;
        li.innerHTML = `
         ${t.title} (${t.category}) - ${t.amount}
         <button class = "delete-btn"> ❌ </button>
        `;
        transactionList.appendChild(li);
    });
}

//update totals
function updateTotals() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  totalIncome.textContent = income;
  totalExpense.textContent = expense;
  balancee.textContent = income - expense;
}
//rendering expense chart
let chart;
function renderChart(){
    const expensesByCategory = {};
    transactions
    .filter(t=> t.type === "expense")
    .forEach(t =>{
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    if(chart) chart.destroy();

    chart = new Chart(chartCanvas,{
        type : "pie",
        data : {
            labels : Object.keys(expensesByCategory),
            datasets : [{
                data : Object.values(expensesByCategory),
                backgroundColor: [
                    '#ff6384', '#36a2eb', '#ffce56',
          '#4bc0c0', '#9966ff', '#ff9f40',
          '#00a86b', '#c0c0c0'
                ]
            }]
        },
        options : { responsive : true}
    });

}

//rendering income chart
let incomeChart;
function renderIncomeChart() {
    const incomeByCategory = {};
    transactions
        .filter(t => t.type === "income")
        .forEach(t => {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        });

    if (incomeChart) incomeChart.destroy();

    incomeChart = new Chart(document.getElementById('income-chart'), {
        type: "pie",
        data: {
            labels: Object.keys(incomeByCategory),
            datasets: [{
                data: Object.values(incomeByCategory),
                backgroundColor: ['#aec6cf','#b19cd9','#ffce56','#4bc0c0','#ff9f40','#00a86b','#c0c0c0','#9966ff']
            }]
        },
        options: { responsive: true }
    });
}

//rendering combined income and expense
let combinedChart;
function renderCombinedChart() {
    const incomeByCategory = {};
    const expenseByCategory = {};

    transactions.forEach(t => {
        if(t.type === "income") incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        if(t.type === "expense") expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

    const categories = Array.from(new Set([...Object.keys(incomeByCategory), ...Object.keys(expenseByCategory)]));

    const incomeData = categories.map(cat => incomeByCategory[cat] || 0);
    const expenseData = categories.map(cat => expenseByCategory[cat] || 0);

    if (combinedChart) combinedChart.destroy();

    combinedChart = new Chart(document.getElementById('combined-chart'), {
        type: "bar",
        data: {
            labels: categories,
            datasets: [
                { label: "Income", data: incomeData, backgroundColor: '#aec6cf' },
                { label: "Expense", data: expenseData, backgroundColor: '#b19cd9' }
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}


saveAndRender();


