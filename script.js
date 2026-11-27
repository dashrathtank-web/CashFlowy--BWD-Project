
const form = document.getElementById("form");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");
const list = document.getElementById("list");
const message = document.getElementById("message");
const addButton = document.getElementById("addButton");
const expenseButton = document.getElementById("expenseButton");
const incomeButton = document.getElementById("incomeButton");
const toast = document.getElementById("toast");
const undoButton = document.getElementById("undoButton");

let entries = [];
let type = "expense";
let deletedEntry = null;
let toastTimer;

function today() { return new Date().toLocaleDateString("en-CA"); }
function money(value) { return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
function save() { localStorage.setItem("cashflowy.entries", JSON.stringify(entries)); }

function load() {
  try { entries = JSON.parse(localStorage.getItem("cashflowy.entries")) || []; }
  catch (error) { entries = []; }
}

function updateTotals() {
  const income = entries.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = entries.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;
  document.getElementById("income").textContent = money(income);
  document.getElementById("expense").textContent = money(expense);
  document.getElementById("balance").textContent = money(balance);
  document.getElementById("balance").className = balance < 0 ? "expense" : "";
}

function showEntries() {
  list.innerHTML = "";
  entries.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  entries.forEach(item => {
    const row = document.createElement("li");
    const sign = item.type === "income" ? "+" : "-";
    const color = item.type === "income" ? "income" : "expense";
    row.innerHTML = `<div class="entry-text"><b>${item.description}</b><small>${item.date}</small></div><span class="amount ${color}">${sign}${money(item.amount)}</span><button data-id="${item.id}">Delete</button>`;
    list.appendChild(row);
  });
  document.getElementById("empty").style.display = entries.length ? "none" : "block";
  updateTotals();
}

function changeType(newType) {
  type = newType;
  expenseButton.classList.toggle("active", type === "expense");
  incomeButton.classList.toggle("active", type === "income");
  addButton.textContent = "Add " + type;
}

function showToast(text, canUndo) {
  document.getElementById("toastText").textContent = text;
  undoButton.style.display = canUndo ? "inline" : "none";
  toast.style.display = "flex";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.display = "none"; deletedEntry = null; }, 5000);
}

expenseButton.onclick = () => changeType("expense");
incomeButton.onclick = () => changeType("income");

form.onsubmit = event => {
  event.preventDefault();
  const amount = Number(amountInput.value);
  if (amount <= 0) { message.textContent = "Amount must be greater than 0."; return; }
  entries.push({ id: Date.now(), type, amount, description: descriptionInput.value.trim() || type, date: dateInput.value });
  message.textContent = "";
  amountInput.value = "";
  descriptionInput.value = "";
  save();
  showEntries();
  showToast(type === "income" ? "Income added" : "Expense added", false);
};

list.onclick = event => {
  const id = Number(event.target.dataset.id);
  if (!id) return;
  deletedEntry = entries.find(item => item.id === id);
  entries = entries.filter(item => item.id !== id);
  save();
  showEntries();
  showToast("Entry deleted", true);
};

undoButton.onclick = () => {
  if (deletedEntry) { entries.push(deletedEntry); deletedEntry = null; save(); showEntries(); }
  toast.style.display = "none";
};

document.getElementById("monthName").textContent = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
dateInput.value = today();
load();
showEntries();

async function startRupeeAnimation() {
  const sceneBox = document.getElementById("rupeeScene");

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(68, 68);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    sceneBox.appendChild(renderer.domElement);

    const textCanvas = document.createElement("canvas");
    textCanvas.width = 256;
    textCanvas.height = 256;
    const context = textCanvas.getContext("2d");
    context.fillStyle = "#d97706";
    context.font = "bold 190px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("₹", 128, 138);

    const texture = new THREE.CanvasTexture(textCanvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const rupee = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), material);
    scene.add(rupee);
    camera.position.z = 4;

    function animate() {
      rupee.rotation.y += 0.02;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  } catch (error) {
    sceneBox.textContent = "₹";
  }
}

startRupeeAnimation();
