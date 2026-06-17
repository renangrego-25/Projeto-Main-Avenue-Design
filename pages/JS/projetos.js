// ─── CONFIG ─────────────────────────────────────────────
  const PASSWORD = 'design123'; // ← TROQUE SUA SENHA AQUI
 
  // ─── AUTH ────────────────────────────────────────────────
  function checkSession() {
    if (sessionStorage.getItem('admin_auth') === 'yes') showAdmin();
  }
 
  function doLogin() {
    const val = document.getElementById('pwd-input').value;
    if (val === PASSWORD) {
      sessionStorage.setItem('admin_auth', 'yes');
      showAdmin();
    } else {
      document.getElementById('login-error').style.display = 'block';
      document.getElementById('pwd-input').value = '';
    }
  }
 
  function doLogout() {
    sessionStorage.removeItem('admin_auth');
    location.reload();
  }
 
  function showAdmin() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderList();
  }
 
  document.getElementById('pwd-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
 
  // ─── DATA ────────────────────────────────────────────────
  function getProjects() {
    try { return JSON.parse(localStorage.getItem('portfolio_projects')) || []; }
    catch { return []; }
  }
 
  function saveProjects(arr) {
    localStorage.setItem('portfolio_projects', JSON.stringify(arr));
  }
 
  // ─── TOOLS CHIPS ─────────────────────────────────────────
  let currentTools = [];
  let currentImg = null;
  let editId = null;
 
  function addTool() {
    const inp = document.getElementById('f-tool-input');
    const val = inp.value.trim();
    if (!val || currentTools.includes(val)) { inp.value = ''; return; }
    currentTools.push(val);
    inp.value = '';
    renderTools();
  }
 
  function removeTool(t) {
    currentTools = currentTools.filter(x => x !== t);
    renderTools();
  }
 
  function renderTools() {
    document.getElementById('tools-list').innerHTML = currentTools.map(t =>
      `<div class="tool-chip">${t} <button onclick="removeTool('${t}')">✕</button></div>`
    ).join('');
  }
 
  // ─── IMAGE ───────────────────────────────────────────────
  function handleImg(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      currentImg = e.target.result;
      document.getElementById('img-preview').innerHTML = `<img src="${currentImg}" alt="">`;
    };
    reader.readAsDataURL(file);
  }
 
  function clearImg() {
    currentImg = null;
    document.getElementById('img-preview').innerHTML = `<div class="img-preview-icon">🖼</div><span>Clique para adicionar imagem</span>`;
    document.getElementById('img-file').value = '';
  }
 
  // ─── FORM ─────────────────────────────────────────────────
  function resetForm() {
    editId = null;
    currentTools = [];
    currentImg = null;
    ['f-title','f-category','f-year','f-desc','f-link','f-tool-input'].forEach(id => document.getElementById(id).value = '');
    renderTools();
    clearImg();
    document.getElementById('form-title').textContent = 'Novo Projeto';
    document.getElementById('edit-indicator').style.display = 'none';
  }
 
  function cancelEdit() { resetForm(); }
 
  function saveProject() {
    const title = document.getElementById('f-title').value.trim();
    if (!title) { showToast('⚠ Informe um título.'); return; }
 
    const projects = getProjects();
 
    const project = {
      id: editId || Date.now().toString(),
      title,
      category: document.getElementById('f-category').value.trim(),
      year: document.getElementById('f-year').value.trim(),
      description: document.getElementById('f-desc').value.trim(),
      link: document.getElementById('f-link').value.trim(),
      tools: [...currentTools],
      image: currentImg,
      createdAt: editId ? (projects.find(p=>p.id===editId)?.createdAt || Date.now()) : Date.now()
    };
 
    if (editId) {
      const idx = projects.findIndex(p => p.id === editId);
      if (idx > -1) projects[idx] = project;
    } else {
      projects.push(project);
    }
 
    saveProjects(projects);
    resetForm();
    renderList();
    showToast(editId ? '✓ Projeto atualizado!' : '✓ Projeto adicionado!');
  }
 
  // ─── LIST ─────────────────────────────────────────────────
  function renderList() {
    const projects = getProjects();
    const list = document.getElementById('project-list');
    const countEl = document.getElementById('proj-count');
    const clearBtn = document.getElementById('clear-all-btn');
 
    countEl.textContent = `${projects.length} projeto${projects.length !== 1 ? 's' : ''} cadastrado${projects.length !== 1 ? 's' : ''}`;
    clearBtn.style.display = projects.length ? 'inline-flex' : 'none';
 
    if (projects.length === 0) {
      list.innerHTML = `
        <div class="empty-admin">
          <div class="empty-admin-icon">✦</div>
          <p>Nenhum projeto ainda.</p>
          <p style="font-size:.8rem">Use o formulário ao lado para adicionar o primeiro projeto.</p>
        </div>`;
      return;
    }
 
    list.innerHTML = projects.slice().reverse().map(p => `
      <div class="project-item">
        <div class="pi-thumb">
          ${p.image ? `<img src="${p.image}" alt="">` : '✦'}
        </div>
        <div class="pi-info">
          <div class="pi-title">${p.title}</div>
          <div class="pi-meta">
            ${p.category ? `<span>📁 ${p.category}</span>` : ''}
            ${p.year ? `<span>📅 ${p.year}</span>` : ''}
            ${p.tools?.length ? `<span>🛠 ${p.tools.slice(0,2).join(', ')}</span>` : ''}
          </div>
        </div>
        <div class="pi-actions">
          <button class="btn btn-ghost" onclick="editProject('${p.id}')">Editar</button>
          <button class="btn btn-danger" onclick="deleteProject('${p.id}')">✕</button>
        </div>
      </div>
    `).join('');
  }
 
  function editProject(id) {
    const p = getProjects().find(x => x.id === id);
    if (!p) return;
 
    editId = id;
    document.getElementById('f-title').value = p.title || '';
    document.getElementById('f-category').value = p.category || '';
    document.getElementById('f-year').value = p.year || '';
    document.getElementById('f-desc').value = p.description || '';
    document.getElementById('f-link').value = p.link || '';
    currentTools = [...(p.tools || [])];
    renderTools();
 
    if (p.image) {
      currentImg = p.image;
      document.getElementById('img-preview').innerHTML = `<img src="${currentImg}" alt="">`;
    } else { clearImg(); }
 
    document.getElementById('form-title').textContent = 'Editar Projeto';
    document.getElementById('edit-indicator').style.display = 'flex';
 
    // scroll sidebar to top on mobile
    document.querySelector('.sidebar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
 
  function deleteProject(id) {
    if (!confirm('Remover este projeto?')) return;
    const projects = getProjects().filter(p => p.id !== id);
    saveProjects(projects);
    renderList();
    showToast('Projeto removido.');
  }
 
  function clearAll() {
    if (!confirm('Apagar TODOS os projetos? Esta ação não pode ser desfeita.')) return;
    saveProjects([]);
    renderList();
    showToast('Todos os projetos foram removidos.');
  }
 
  // ─── TOAST ────────────────────────────────────────────────
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
 
  // ─── INIT ─────────────────────────────────────────────────
  checkSession();