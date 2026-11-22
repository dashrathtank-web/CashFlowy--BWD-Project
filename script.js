
var transactions = [];

var form = document.getElementById("form");
var descriptionInput = document.getElementById("description");
var amountInput = document.getElementById("amount");
var typeInput = document.getElementById("type");
var message = document.getElementById("message");
var list = document.getElementById("list");

function showAll() {
  var income = 0;
  var expense = 0;

  list.innerHTML = "";

  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];

    if (t.type == "income") {
      income = income + t.amount;
    } else {
      expense = expense + t.amount;
    }

    var li = document.createElement("li");
    li.textContent = t.description + " : ₹" + t.amount;

    var button = document.createElement("button");
    button.textContent = "Delete";
    button.setAttribute("data-index", i);
    button.onclick = deleteEntry;

    li.appendChild(button);
    list.appendChild(li);
  }

  document.getElementById("income").textContent = "₹" + income;
  document.getElementById("expense").textContent = "₹" + expense;
  document.getElementById("balance").textContent = "₹" + (income - expense);
}

function deleteEntry() {
  var index = this.getAttribute("data-index");
  transactions.splice(index, 1);
  showAll();
}

form.onsubmit = function (event) {
  event.preventDefault();

  var description = descriptionInput.value;
  var amount = Number(amountInput.value);

  if (description == "" || amount <= 0) {
    message.textContent = "Please write a description and an amount more than 0.";
    return;
  }

  message.textContent = "";
  transactions.push({
    description: description,
    amount: amount,
    type: typeInput.value
  });

  descriptionInput.value = "";
  amountInput.value = "";
  showAll();
};

showAll();
