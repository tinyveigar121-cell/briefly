// Supabase Configuration
const SUPABASE_URL = 'https://kxmecexovhxryxfdxkgu.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_secret_GudterViXLcHQJvr82aR5g_5MkpUHh9';

let supabase = null;
if (SUPABASE_URL !== 'https://example.supabase.co') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let currentUser = null;
let currentProject = null;
let editingProjectId = null;

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(168, 85, 247, ' + p.opacity + ')';
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-form').classList.add('active');
        document.getElementById('login-error').textContent = '';
        document.getElementById('signup-error').textContent = '';
        document.getElementById('signup-success').textContent = '';
    });
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = '';
    if (!supabase) {
        errorDiv.textContent = 'Supabase not configured.';
        showToast('Configure Supabase to enable auth');
        return;
    }
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        currentUser = data.user;
        document.getElementById('nav-user-email').textContent = currentUser.email;
        document.getElementById('main-nav').style.display = 'block';
        showScreen('dashboard-screen');
        loadProjects();
        showToast('Welcome back!');
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const fullName = document.getElementById('signup-fullname').value;
    const errorDiv = document.getElementById('signup-error');
    const successDiv = document.getElementById('signup-success');
    errorDiv.textContent = '';
    successDiv.textContent = '';
    if (!supabase) {
        errorDiv.textContent = 'Supabase not configured.';
        showToast('Configure Supabase to enable auth');
        return;
    }
    try {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        successDiv.textContent = 'Account created! Check your email to verify.';
        document.getElementById('signup-form').reset();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

document.getElementById('nav-logout').addEventListener('click', async () => {
    if (supabase) await supabase.auth.signOut();
    currentUser = null;
    document.getElementById('main-nav').style.display = 'none';
    showScreen('auth-screen');
    showToast('Signed out');
});

document.getElementById('nav-dashboard').addEventListener('click', () => { showScreen('dashboard-screen'); loadProjects(); });
document.getElementById('nav-new-project').addEventListener('click', () => { editingProjectId = null; document.getElementById('form-title').textContent = 'Create New Brief'; document.getElementById('project-form').reset(); showScreen('project-form-screen'); });
document.getElementById('dashboard-new-project').addEventListener('click', () => { editingProjectId = null; document.getElementById('form-title').textContent = 'Create New Brief'; document.getElementById('project-form').reset(); showScreen('project-form-screen'); });
document.getElementById('empty-new-project').addEventListener('click', () => { editingProjectId = null; document.getElementById('form-title').textContent = 'Create New Brief'; document.getElementById('project-form').reset(); showScreen('project-form-screen'); });
document.getElementById('form-cancel').addEventListener('click', () => { showScreen('dashboard-screen'); loadProjects(); });
document.getElementById('form-back-dashboard').addEventListener('click', () => { showScreen('dashboard-screen'); loadProjects(); });

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    const emptyState = document.getElementById('no-projects');
    grid.innerHTML = '';
    if (!supabase || !currentUser) {
        emptyState.style.display = 'block';
        return;
    }
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (data.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';
        data.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = '<div class=\"project-card-header\"><h3 class=\"project-card-title\">' + escapeHtml(project.project_name) + '</h3><span class=\"project-card-type\">' + formatProjectType(project.project_type) + '</span></div><div class=\"project-card-client\">' + (project.client_name ? escapeHtml(project.client_name) : 'No client') + '</div><div class=\"project-card-date\">' + new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</div>';
            card.addEventListener('click', () => openProjectPreview(project));
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        emptyState.style.display = 'block';
    }
}

function formatProjectType(type) {
    const types = { 'logo': 'LOGO', 'branding': 'BRANDING', 'social': 'SOCIAL', 'web': 'WEB' };
    return types[type] || type.toUpperCase();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectData = {
        project_name: document.getElementById('project-name').value,
        project_type: document.getElementById('project-type').value,
        client_name: document.getElementById('client-name').value,
        goals: document.getElementById('goals').value,
        target_audience: document.getElementById('target-audience').value,
        visual_direction: document.getElementById('visual-direction').value,
        colors: document.getElementById('colors').value,
        deliverables: document.getElementById('deliverables').value,
        requirements: document.getElementById('requirements').value,
        client_notes: document.getElementById('client-notes').value,
        user_id: currentUser && currentUser.id
    };
    if (!projectData.project_name || !projectData.project_type || !projectData.goals || !projectData.target_audience || !projectData.visual_direction || !projectData.deliverables) {
        showToast('Please fill in all required fields');
        return;
    }
    if (!supabase || !currentUser) {
        showToast('Please sign in');
        showScreen('auth-screen');
        return;
    }
    try {
        if (editingProjectId) {
            const { error } = await supabase.from('projects').update(projectData).eq('id', editingProjectId).eq('user_id', currentUser.id);
            if (error) throw error;
            showToast('Brief updated!');
        } else {
            const { data, error } = await supabase.from('projects').insert([{ ...projectData, created_at: new Date().toISOString() }]).select();
            if (error) throw error;
            currentProject = data[0];
            showToast('Brief created!');
        }
        loadProjects();
        openProjectPreview(projectData, editingProjectId);
    } catch (error) {
        console.error('Error:', error);
        showToast('Error saving project');
    }
});

document.getElementById('form-save-draft').addEventListener('click', async () => {
    const projectData = {
        project_name: document.getElementById('project-name').value,
        project_type: document.getElementById('project-type').value,
        client_name: document.getElementById('client-name').value,
        goals: document.getElementById('goals').value,
        target_audience: document.getElementById('target-audience').value,
        visual_direction: document.getElementById('visual-direction').value,
        colors: document.getElementById('colors').value,
        deliverables: document.getElementById('deliverables').value,
        requirements: document.getElementById('requirements').value,
        client_notes: document.getElementById('client-notes').value,
        user_id: currentUser && currentUser.id
    };
    if (!projectData.project_name) {
        showToast('Add a project name');
        return;
    }
    if (!supabase || !currentUser) {
        showToast('Please sign in');
        showScreen('auth-screen');
        return;
    }
    try {
        if (editingProjectId) {
            const { error } = await supabase.from('projects').update(projectData).eq('id', editingProjectId).eq('user_id', currentUser.id);
            if (error) throw error;
            showToast('Draft updated');
        } else {
            const { data, error } = await supabase.from('projects').insert([{ ...projectData, created_at: new Date().toISOString() }]).select();
            if (error) throw error;
            editingProjectId = data[0].id;
            showToast('Draft saved');
        }
        loadProjects();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error saving');
    }
});

function openProjectPreview(project, projectId) {
    currentProject = project;
    if (projectId) editingProjectId = projectId;
    else if (project.id) editingProjectId = project.id;
    document.getElementById('preview-project-name').textContent = project.project_name;
    document.getElementById('brief-title').textContent = project.project_name;
    document.getElementById('brief-type').textContent = formatProjectType(project.project_type);
    if (project.client_name) {
        document.getElementById('brief-client').textContent = project.client_name;
        document.getElementById('brief-client-wrapper').style.display = 'flex';
    } else {
        document.getElementById('brief-client-wrapper').style.display = 'none';
    }
    document.getElementById('brief-date').textContent = project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('brief-goals').textContent = project.goals || '';
    document.getElementById('brief-audience').textContent = project.target_audience || '';
    document.getElementById('brief-visual').textContent = project.visual_direction || '';
    if (project.colors) {
        document.getElementById('brief-colors').textContent = project.colors;
        document.getElementById('brief-colors-wrapper').style.display = 'block';
    } else {
        document.getElementById('brief-colors-wrapper').style.display = 'none';
    }
    document.getElementById('brief-deliverables').textContent = project.deliverables || '';
    if (project.requirements) {
        document.getElementById('brief-requirements').textContent = project.requirements;
        document.getElementById('brief-requirements-wrapper').style.display = 'block';
    } else {
        document.getElementById('brief-requirements-wrapper').style.display = 'none';
    }
    if (project.client_notes) {
        document.getElementById('brief-notes').textContent = project.client_notes;
        document.getElementById('brief-notes-wrapper').style.display = 'block';
    } else {
        document.getElementById('brief-notes-wrapper').style.display = 'none';
    }
    showScreen('preview-screen');
}

document.getElementById('preview-back').addEventListener('click', () => { showScreen('dashboard-screen'); loadProjects(); });
document.getElementById('preview-edit').addEventListener('click', () => {
    if (!currentProject) return;
    document.getElementById('form-title').textContent = 'Edit Brief';
    document.getElementById('project-name').value = currentProject.project_name || '';
    document.getElementById('project-type').value = currentProject.project_type || '';
    document.getElementById('client-name').value = currentProject.client_name || '';
    document.getElementById('goals').value = currentProject.goals || '';
    document.getElementById('target-audience').value = currentProject.target_audience || '';
    document.getElementById('visual-direction').value = currentProject.visual_direction || '';
    document.getElementById('colors').value = currentProject.colors || '';
    document.getElementById('deliverables').value = currentProject.deliverables || '';
    document.getElementById('requirements').value = currentProject.requirements || '';
    document.getElementById('client-notes').value = currentProject.client_notes || '';
    showScreen('project-form-screen');
});
document.getElementById('preview-copy').addEventListener('click', () => {
    const briefText = 'PROJECT BRIEF: ' + document.getElementById('brief-title').textContent + '\n\nProject Type: ' + document.getElementById('brief-type').textContent + '\n' + (document.getElementById('brief-client').textContent ? 'Client: ' + document.getElementById('brief-client').textContent + '\n' : '') + 'Created: ' + document.getElementById('brief-date').textContent + '\n\nGOALS:\n' + document.getElementById('brief-goals').textContent + '\n\nTARGET AUDIENCE:\n' + document.getElementById('brief-audience').textContent + '\n\nVISUAL DIRECTION:\n' + document.getElementById('brief-visual').textContent + (document.getElementById('brief-colors').textContent ? '\n\nCOLOR PREFERENCES:\n' + document.getElementById('brief-colors').textContent : '') + '\n\nDELIVERABLES:\n' + document.getElementById('brief-deliverables').textContent + (document.getElementById('brief-requirements').textContent ? '\n\nREQUIREMENTS & CONSTRAINTS:\n' + document.getElementById('brief-requirements').textContent : '') + (document.getElementById('brief-notes').textContent ? '\n\nADDITIONAL NOTES:\n' + document.getElementById('brief-notes').textContent : '');
    navigator.clipboard.writeText(briefText).then(() => showToast('Brief copied'));
});
document.getElementById('preview-export-pdf').addEventListener('click', () => {
    const element = document.getElementById('brief-content');
    const opt = {
        margin: [10, 10, 10, 10],
        filename: document.getElementById('brief-title').textContent.replace(/[^a-z0-9]/gi, '_') + '_Brief.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => showToast('PDF exported'));
});

window.addEventListener('DOMContentLoaded', async () => {
    initParticles();
    if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data && data.session) {
            currentUser = data.session.user;
            document.getElementById('nav-user-email').textContent = currentUser.email;
            document.getElementById('main-nav').style.display = 'block';
            showScreen('dashboard-screen');
            loadProjects();
        } else {
            showScreen('auth-screen');
        }
    } else {
        showScreen('auth-screen');
    }
    async function testSupabase() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Supabase connected successfully!", data);
  }
}

testSupabase();
});
