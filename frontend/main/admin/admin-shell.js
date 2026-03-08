(function () {
  const POSITIONS_KEY = 'adminPositions';
  const ACTIVE_KEY = 'adminActivePositionId';

  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function getPositions() {
    const positions = safeJsonParse(localStorage.getItem(POSITIONS_KEY) || '[]', []);
    if (Array.isArray(positions) && positions.length > 0) return positions;

    // 兼容：如果暂时没有 positions，则用登录 role 派生一个默认职位
    const role = localStorage.getItem('role') || localStorage.getItem('userRole') || '';
    const derived = derivePositionFromRole(role);
    return derived ? [derived] : [];
  }

  function derivePositionFromRole(role) {
    // 这里先做“最小可用”，后续后端落地 positions 后即可弃用
    const map = {
      super_admin: {
        id: 'derived-super-admin',
        role: 'super_admin',
        label: '平台 · 超级管理员',
        target: '/main/admin/super_admin_index.html'
      },
      school_admin: {
        id: 'derived-school-admin',
        role: 'school_admin',
        label: '学校 · 管理员',
        target: '/main/admin/school_admin_index.html'
      },
      merchant_admin: {
        id: 'derived-merchant-admin',
        role: 'merchant_admin',
        label: '商户 · 管理员',
        target: '/main/admin/merchant_admin_index.html'
      },
      stall_admin: {
        id: 'derived-stall-admin',
        role: 'stall_admin',
        label: '档口 · 管理员',
        target: '/main/admin/stall_dashboard.html'
      }
    };

    return map[role] || null;
  }

  function setUserChip() {
    const username = localStorage.getItem('username') || localStorage.getItem('userName') || '未登录';
    const el = document.getElementById('userName');
    if (el) el.textContent = username;
  }

  function setEmptyVisible(visible) {
    const empty = document.getElementById('emptyState');
    const frame = document.getElementById('contentFrame');
    if (empty) empty.style.display = visible ? 'flex' : 'none';
    if (frame) frame.style.display = visible ? 'none' : 'block';
  }

  function getActivePositionId(positions) {
    const saved = localStorage.getItem(ACTIVE_KEY);
    if (saved && positions.some(p => p.id === saved)) return saved;
    return positions[0]?.id;
  }

  function renderPositions(positions) {
    const select = document.getElementById('positionSelect');
    if (!select) return;

    select.innerHTML = '';

    positions.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      let showText = p.label || p.id;
      // 超级管理员强制显示「平台 · 超级管理员」，屏蔽后端错误的学校前缀
      if (p.role === 'super_admin') {
        showText = '平台 · 超级管理员';
      }
      opt.textContent = showText;
      select.appendChild(opt);
    });

    const activeId = getActivePositionId(positions);
    select.value = activeId;

    if (!activeId && positions[0]) {
      localStorage.setItem(ACTIVE_KEY, positions[0].id);
    }

    select.addEventListener('change', function () {
      localStorage.setItem(ACTIVE_KEY, this.value);
      loadActive(positions);
    });
  }

  function buildEmbeddedUrl(target) {
    const url = new URL(target, window.location.origin);
    url.searchParams.set('shell', '1');
    return url.toString();
  }

  function loadActive(positions) {
    const activeId = getActivePositionId(positions);
    const position = positions.find(p => p.id === activeId) || positions[0];

    if (!position || !position.target) {
      setEmptyVisible(true);
      return;
    }

    setEmptyVisible(false);

    const frame = document.getElementById('contentFrame');
    if (!frame) return;

    localStorage.setItem(ACTIVE_KEY, position.id);
    frame.src = buildEmbeddedUrl(position.target);
  }

  function wireLogout() {
    const btn = document.getElementById('logoutBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (!confirm('确定要退出登录吗？')) return;
      try {
        if (window.Router && Router.clearUserData) {
          Router.clearUserData();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminPositions');
          localStorage.removeItem('adminActivePositionId');
        }
      } catch (_) {}

      if (window.Router && Router.toAdminLogin) {
        Router.toAdminLogin();
      } else {
        window.location.href = '/login/admin_login.html';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('adminToken')) {
      if (window.Router && Router.toAdminLogin) {
        Router.toAdminLogin();
      } else {
        window.location.href = '/login/admin_login.html';
      }
      return;
    }

    setUserChip();
    wireLogout();

    const positions = getPositions();
    if (!positions || positions.length === 0) {
      setEmptyVisible(true);
      return;
    }

    renderPositions(positions);
    loadActive(positions);
  });
})();
