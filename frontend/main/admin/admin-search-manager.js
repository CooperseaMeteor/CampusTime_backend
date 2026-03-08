/**
 * 管理员搜索和导航管理器
 * 功能：搜索、我的创建列表、树展开和跳转
 */

class AdminSearchManager {
  constructor() {
    this.allAdmins = [];
    this.currentAdminTree = null;
    this.expandedNodes = new Set();
    this.init();
  }

  /**
   * 初始化搜索和导航功能
   */
  init() {
    this.bindSearchEvents();
    this.bindSidebarEvents();
    this.loadAdminData();
  }

  /**
   * 绑定搜索输入事件
   */
  bindSearchEvents() {
    const searchInput = document.getElementById('adminSearch');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput && searchBtn) {
      searchBtn.addEventListener('click', () => this.performSearch());
      clearBtn?.addEventListener('click', () => this.clearSearch());
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.performSearch();
      });
    }
  }

  /**
   * 执行搜索
   */
  performSearch() {
    const searchInput = document.getElementById('adminSearch');
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      this.clearSearch();
      return;
    }

    const results = this.allAdmins.filter(admin =>
      admin.name.toLowerCase().startsWith(query) ||
      admin.username?.toLowerCase().startsWith(query)
    );

    this.displaySearchResults(results, query);
  }

  /**
   * 显示搜索结果
   */
  displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">未找到匹配的管理员</div>';
      searchResults.style.display = 'block';
      return;
    }

    let html = `<div class="search-header">找到 ${results.length} 个结果</div>`;
    results.forEach(admin => {
      html += `
        <div class="search-result-item" data-admin-id="${admin.id}">
          <div class="result-name">${this.highlightQuery(admin.name, query)}</div>
          <div class="result-info">
            <span class="result-identity">${admin.identityLabel}</span>
            <span class="result-role">${admin.position}</span>
          </div>
          <div class="result-node">${admin.nodePath || '待分配'}</div>
        </div>
      `;
    });

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';

    // 绑定搜索结果点击事件
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const adminId = item.getAttribute('data-admin-id');
        this.navigateToAdmin(adminId);
      });
    });
  }

  /**
   * 高亮查询关键词
   */
  highlightQuery(text, query) {
    const index = text.toLowerCase().indexOf(query);
    if (index === -1) return text;
    return (
      text.substring(0, index) +
      `<strong>${text.substring(index, index + query.length)}</strong>` +
      text.substring(index + query.length)
    );
  }

  /**
   * 清空搜索
   */
  clearSearch() {
    const searchInput = document.getElementById('adminSearch');
    const searchResults = document.getElementById('searchResults');

    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.style.display = 'none';
  }

  /**
   * 导航到指定管理员
   */
  navigateToAdmin(adminId) {
    const adminRow = document.querySelector(`[data-admin-id="${adminId}"]`);
    if (!adminRow) {
      alert('管理员不在列表中或权限不足');
      return;
    }

    // 获取节点的树路径，展开所有父节点
    const nodePath = this.getNodePath(adminRow);
    nodePath.forEach(nodeId => this.expandNode(nodeId));

    // 清空搜索，滚动到目标
    this.clearSearch();
    adminRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    adminRow.classList.add('highlight');
    setTimeout(() => adminRow.classList.remove('highlight'), 3000);
  }

  /**
   * 获取节点的树路径（从根到该节点）
   */
  getNodePath(element) {
    const path = [];
    let current = element;

    while (current && current !== document.body) {
      const nodeId = current.getAttribute('data-node-id');
      if (nodeId) path.unshift(nodeId);
      current = current.parentElement;
    }

    return path;
  }

  /**
   * 展开指定节点
   */
  expandNode(nodeId) {
    const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeEl) return;

    const childrenContainer = nodeEl.querySelector('.node-children');
    const expandBtn = nodeEl.querySelector('.expand-btn');

    if (childrenContainer) {
      childrenContainer.style.display = 'block';
      this.expandedNodes.add(nodeId);
      if (expandBtn) expandBtn.textContent = '▼';
    }
  }

  /**
   * 折叠指定节点
   */
  collapseNode(nodeId) {
    const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeEl) return;

    const childrenContainer = nodeEl.querySelector('.node-children');
    const expandBtn = nodeEl.querySelector('.expand-btn');

    if (childrenContainer) {
      childrenContainer.style.display = 'none';
      this.expandedNodes.delete(nodeId);
      if (expandBtn) expandBtn.textContent = '▶';
    }
  }

  /**
   * 绑定侧栏"我的创建"事件
   */
  bindSidebarEvents() {
    const sidebar = document.getElementById('createdAdminsSidebar');
    if (!sidebar) return;

    // 加载我的创建列表
    this.loadCreatedAdmins();

    // 绑定关闭按钮
    const closeBtn = sidebar.querySelector('.sidebar-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSidebar());
    }
  }

  /**
   * 加载我的创建管理员列表
   */
  loadCreatedAdmins() {
    // 实际应用中从后端获取：GET /api/admin/created-by-me
    const token = localStorage.getItem('adminToken');
    const positionId = localStorage.getItem('adminActivePositionId');

    fetch('/api/admin/created-by-me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Active-Position-Id': positionId
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.displayCreatedAdmins(data.data);
        }
      })
      .catch(err => {
        console.error('加载我的创建列表失败:', err);
        // 使用 mock 数据
        this.displayCreatedAdmins(this.getMockCreatedAdmins());
      });
  }

  /**
   * 显示我的创建列表
   */
  displayCreatedAdmins(admins) {
    const createdList = document.getElementById('createdAdminsList');
    if (!createdList) return;

    if (!admins || admins.length === 0) {
      createdList.innerHTML = '<div class="created-empty">您还未创建任何管理员</div>';
      return;
    }

    let html = '';
    admins.forEach(admin => {
      const createdDate = new Date(admin.createdAt).toLocaleDateString('zh-CN');
      html += `
        <div class="created-admin-item" data-admin-id="${admin.id}">
          <div class="created-admin-header">
            <span class="created-admin-name">${admin.name}</span>
            <span class="created-admin-date">${createdDate}</span>
          </div>
          <div class="created-admin-info">
            <span class="created-admin-identity">${admin.identityLabel}</span>
            <span class="created-admin-role">${admin.position}</span>
          </div>
          <div class="created-admin-actions">
            <button class="btn-edit" data-id="${admin.id}">编辑</button>
            <button class="btn-view" data-id="${admin.id}">查看</button>
          </div>
        </div>
      `;
    });

    createdList.innerHTML = html;

    // 绑定事件
    document.querySelectorAll('.created-admin-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const adminId = item.getAttribute('data-admin-id');
          this.navigateToAdmin(adminId);
        }
      });

      // 编辑按钮
      item.querySelector('.btn-edit')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const adminId = e.target.getAttribute('data-id');
        if (window.adminModalMgr) {
          window.adminModalMgr.openAdminForm('edit', { id: adminId });
        }
      });
    });
  }

  /**
   * 获取 mock 数据
   */
  getMockCreatedAdmins() {
    return [
      {
        id: 101,
        name: '王小明',
        identityLabel: '工作人员',
        position: '管理员',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 102,
        name: '李四',
        identityLabel: '教职工',
        position: '学校管理员',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * 关闭侧栏
   */
  closeSidebar() {
    const sidebar = document.getElementById('createdAdminsSidebar');
    if (sidebar) {
      sidebar.classList.remove('show');
    }
  }

  /**
   * 显示侧栏
   */
  showSidebar() {
    const sidebar = document.getElementById('createdAdminsSidebar');
    if (sidebar) {
      sidebar.classList.add('show');
      this.loadCreatedAdmins();
    }
  }

  /**
   * 加载所有管理员数据
   */
  loadAdminData() {
    const token = localStorage.getItem('adminToken');
    const positionId = localStorage.getItem('adminActivePositionId');

    fetch('/api/admin/list', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Active-Position-Id': positionId
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.allAdmins = this.flattenAdminTree(data.data);
          this.currentAdminTree = data.data;
        }
      })
      .catch(err => {
        console.error('加载管理员列表失败:', err);
      });
  }

  /**
   * 将树结构展平为数组
   */
  flattenAdminTree(tree) {
    const result = [];

    const traverse = (nodes, path = []) => {
      if (!nodes) return;
      nodes.forEach(node => {
        if (node.type === 'admin' || node.type === 'unassigned') {
          result.push({
            ...node,
            nodePath: path.join(' / ') || '待分配'
          });
          return;
        }

        const currentPath = node.name ? [...path, node.name] : path;

        if (node.admins && node.admins.length > 0) {
          node.admins.forEach(admin => {
            result.push({
              ...admin,
              nodePath: currentPath.join(' / ')
            });
          });
        }

        if (node.children) {
          traverse(node.children, currentPath);
        }
      });
    };

    traverse(tree);
    return result;
  }

  /**
   * 刷新列表
   */
  refresh() {
    this.loadAdminData();
    this.clearSearch();
  }
}

// 导出实例
const adminSearchMgr = new AdminSearchManager();
