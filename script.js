function byId(id) {
  return document.getElementById(id);
}

function updateSummary() {
  const nome = byId("nome").value.trim();
  const telefone = byId("telefone").value.trim();
  const email = byId("email").value.trim();
  const categoria = byId("categoriaServico").value;
  const detalhes = byId("detalhesServico").value.trim();
  const preferenciaContato = byId("preferenciaContato").value;
  const periodoPreferencial = byId("periodoPreferencial").value;

  const empty = !nome && !telefone && !categoria && !detalhes;
  const summaryEmpty = byId("summaryEmpty");
  const summaryContent = byId("summaryContent");

  if (empty) {
    summaryEmpty.hidden = false;
    summaryContent.hidden = true;
    return;
  }

  summaryEmpty.hidden = true;
  summaryContent.hidden = false;

  byId("summaryNome").textContent = nome || "Nome ainda não informado";

  let contato = [];
  if (telefone) contato.push("WhatsApp/Telefone: " + telefone);
  if (email) contato.push("E-mail: " + email);
  byId("summaryContato").textContent =
    contato.join(" | ") || "Contato ainda não informado";

  byId("summaryCategoria").textContent =
    categoria || "Categoria ainda não selecionada";
  byId("summaryDetalhes").textContent =
    detalhes || "Você ainda não descreveu o serviço desejado.";

  byId("summaryPreferencias").textContent =
    "Contato por " +
    (preferenciaContato || "não definido") +
    " • Período: " +
    (periodoPreferencial || "não definido");
}

function saveFormToLocalStorage(data) {
  try {
    const existing = JSON.parse(
      localStorage.getItem("jpdev_solicitacoes") || "[]"
    );
    existing.push({
      ...data,
      criadoEm: new Date().toISOString(),
    });
    localStorage.setItem("jpdev_solicitacoes", JSON.stringify(existing));
  } catch (e) {
    console.warn("Não foi possível salvar no localStorage:", e);
  }
}

async function sendEmail(formData) {
  // O endpoint correto para envio via Fetch (AJAX) no Formspree EXIGE o "/f/"
  const endpoint = "https://formspree.io/f/mjgawwvg";
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const result = await response.json();
      return { 
        success: false, 
        message: result.error || "Erro desconhecido no servidor." 
      };
    }
  } catch (error) {
    console.error("Erro na requisição de e-mail:", error);
    return { 
      success: false, 
      message: "Falha na conexão. Verifique sua internet." 
    };
  }
}

async function handleMainFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalBtnText = btn.textContent;
  
  const oldError = form.querySelector('.error-message-submit');
  if (oldError) oldError.remove();

  btn.disabled = true;
  btn.textContent = "Enviando...";

  const data = {
    nome: byId("nome").value.trim(),
    cpfCnpj: byId("cpfCnpj").value.trim(),
    telefone: byId("telefone").value.trim(),
    email: byId("email").value.trim(),
    endereco: byId("endereco").value.trim(),
    categoriaServico: byId("categoriaServico").value,
    detalhesServico: byId("detalhesServico").value.trim(),
    preferenciaContato: byId("preferenciaContato").value,
    periodoPreferencial: byId("periodoPreferencial").value,
  };

  saveFormToLocalStorage(data);

  const formData = new FormData(form);
  const result = await sendEmail(formData);

  btn.disabled = false;
  btn.textContent = originalBtnText;

  if (result.success) {
    const success = byId("mainFormSuccess");
    success.hidden = false;
    form.reset();
    updateSummary();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-message-submit';
    errorMsg.style.color = '#ff4d4d';
    errorMsg.style.marginTop = '10px';
    errorMsg.style.fontSize = '0.9rem';
    
    // Se a mensagem contiver "unverified", avisar sobre o e-mail de ativação
    if (result.message.toLowerCase().includes("unverified")) {
      errorMsg.textContent = 'Atenção: Você precisa confirmar seu e-mail no Formspree antes de receber mensagens. Verifique seu e-mail pablolpe1228@gmail.com.';
    } else {
      errorMsg.textContent = 'Erro ao enviar: ' + result.message;
    }
    
    form.appendChild(errorMsg);
  }
}

async function handleHeroQuickFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalBtnText = btn.textContent;

  const oldError = form.querySelector('.error-message-submit');
  if (oldError) oldError.remove();

  btn.disabled = true;
  btn.textContent = "Enviando...";

  const nome = byId("heroNome").value.trim();
  const whatsapp = byId("heroWhatsapp").value.trim();
  const tipoServico = byId("heroTipoServico").value;

  const data = {
    nome,
    telefone: whatsapp,
    categoriaServico: tipoServico,
    origem: "form_quick_hero",
  };

  saveFormToLocalStorage(data);

  const formData = new FormData(form);
  const result = await sendEmail(formData);

  btn.disabled = false;
  btn.textContent = originalBtnText;

  if (result.success) {
    byId("heroQuickForm").hidden = true;
    byId("heroQuickSuccess").hidden = false;
  } else {
    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-message-submit';
    errorMsg.style.color = '#ff4d4d';
    errorMsg.style.marginTop = '10px';
    errorMsg.style.fontSize = '0.8rem';
    errorMsg.textContent = 'Erro: ' + result.message;
    form.appendChild(errorMsg);
  }
}

function resetHeroForm() {
  const form = byId("heroQuickForm");
  form.reset();
  form.hidden = false;
  byId("heroQuickSuccess").hidden = true;
}

function initSummaryListeners() {
  const ids = [
    "nome",
    "telefone",
    "email",
    "categoriaServico",
    "detalhesServico",
    "preferenciaContato",
    "periodoPreferencial",
  ];

  ids.forEach((id) => {
    const el = byId(id);
    if (!el) return;
    ["input", "change"].forEach((evt) => {
      el.addEventListener(evt, updateSummary);
    });
  });
}

function initYear() {
  const yearSpan = byId("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const mainForm = byId("mainForm");
  if (mainForm) {
    mainForm.addEventListener("submit", handleMainFormSubmit);
  }

  const heroForm = byId("heroQuickForm");
  if (heroForm) {
    heroForm.addEventListener("submit", handleHeroQuickFormSubmit);
  }

  initSummaryListeners();
  updateSummary();
  initYear();
});

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "01";
const fontSize = 14;
const columns = canvas.width / fontSize;

const drops = [];

for(let x = 0; x < columns; x++)
    drops[x] = 1;

function draw(){

    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#00ff9f";
    ctx.font = fontSize + "px monospace";

    for(let i = 0; i < drops.length; i++){

        const text = letters[Math.floor(Math.random()*letters.length)];

        ctx.fillText(text, i*fontSize, drops[i]*fontSize);

        if(drops[i]*fontSize > canvas.height && Math.random() > 0.975)
            drops[i] = 0;

        drops[i]++;
    }
}

setInterval(draw,33);
