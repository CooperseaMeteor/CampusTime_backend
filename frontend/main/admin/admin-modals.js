/**
 * 管理员操作弹窗组件库
 * 包括：新增/编辑管理员、调岗、权限管理、身份标签审核等
 */

class AdminModalManager {
  constructor() {
    this.modalContainer = null;
    this.initModals();
  }

  initModals() {
    // 创建容器
    if (!document.getElementById('admin-modals')) {
      const container = document.createElement('div');
      container.id = 'admin-modals';
      document.body.appendChild(container);
      this.modalContainer = container;
    }
  }

  /**
   * 打开新增/编辑管理员弹窗
   */
  openAdminForm(mode = 'create', adminData = null) {
    const html = `
      <div class="admin-modal-overlay" onclick="this.closest('.admin-modal-overlay').remove()">
        <div class="admin-modal" onclick="event.stopPropagation()">
          <div class="admin-modal-header">
            <h3>${mode === 'create' ? '新增管理员' : '编辑管理员'}</h3>
            <span class="admin-modal-close" onclick="this.closest('.admin-modal-overlay').remove()">×</span>
          </div>
          <form class="admin-form" data-mode="${mode}">
            <div class="form-section">
              <h4>基础信息</h4>
              <div class="form-group">
                <label>用户名 *</label>
                <input type="text" name="username" required ${mode === 'edit' ? 'disabled' : ''} value="${adminData?.username || ''}" />
              </div>
              ${mode === 'create' ? `
              <div class="form-group">
                <label>初始密码 *</label>
                <input type="password" name="password" required placeholder="请输入初始密码" />
              </div>
              ` : ''}
              <div class="form-group">
                <label>真实姓名 *</label>
                <input type="text" name="realName" required value="${adminData?.realName || ''}" />
              </div>
              <div class="form-group">
                <label>手机</label>
                <input type="tel" name="phone" value="${adminData?.phone || ''}" />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input type="email" name="email" value="${adminData?.email || ''}" />
              </div>
            </div>

            <div class="form-section">
              <h4>身份标签</h4>
              <div class="form-group">
                <label>身份标签 *</label>
                <select name="identityLabel" required>
                  <option value="">-- 请选择 --</option>
                  <option value="教职工" ${adminData?.identityLabel === '教职工' ? 'selected' : ''}>教职工（有编制）</option>
                  <option value="工作人员" ${adminData?.identityLabel === '工作人员' ? 'selected' : ''}>工作人员（一线）</option>
                  <option value="运营专员" ${adminData?.identityLabel === '运营专员' ? 'selected' : ''}>运营专员（管理）</option>
                </select>
              </div>
              <div class="form-group">
                <label>自定义后缀（可选）</label>
                <input type="text" name="identitySuffix" placeholder="如：主播、审核员、档口长等" value="${adminData?.identitySuffix || ''}" />
                <small style="color: #999; display: block; margin-top: 4px;">创建时填写会立即生效；后续申请需要上级审核</small>
              </div>
            </div>

            <div class="form-section">
              <h4>职位信息</h4>
              <div class="form-group">
                <label>角色 *</label>
                <select name="role" required onchange="updateNodeRequirement(this)">
                  <option value="">-- 请选择 --</option>
                  <option value="super_admin" ${adminData?.role === 'super_admin' ? 'selected' : ''}>超级管理员 (L0)</option>
                  <option value="school_admin" ${adminData?.role === 'school_admin' ? 'selected' : ''}>学校管理员 (L1)</option>
                  <option value="merchant_admin" ${adminData?.role === 'merchant_admin' ? 'selected' : ''}>商户管理员 (L2)</option>
                  <option value="stall_admin" ${adminData?.role === 'stall_admin' ? 'selected' : ''}>档口管理员 (L3)</option>
                </select>
              </div>
              <div class="form-group" id="nodeGroup" style="display: none;">
                <label>绑定节点</label>
                <input type="text" name="nodePath" placeholder="点击选择学校/商户/档口" readonly onclick="openNodeSelector(this)" class="node-input" />
                <small style="color: #999; display: block; margin-top: 4px;" id="nodeInfo"></small>
                <input type="hidden" name="school_id" />
                <input type="hidden" name="merchant_node_id" />
                <input type="hidden" name="stall_id" />
              </div>
            </div>

            <div class="form-section" id="advancedSection" style="display: none;">
              <h4>
                <input type="checkbox" id="showAdvanced" onchange="toggleAdvanced(this)" />
                <label for="showAdvanced" style="display: inline; margin: 0;">高级设置（自定义权限）</label>
              </h4>
              <div id="advancedContent" style="display: none;">
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                  <div style="color: #999; font-size: 12px; margin-bottom: 10px;">
                    勾选的权限 = 角色默认权限 ∩ 你拥有的权限
                  </div>
                  <div id="permissionsCheckbox">
                    <!-- 权限列表会动态填充 -->
                  </div>
                </div>
              </div>
            </div>

            <div class="form-footer">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.admin-modal-overlay').remove()">取消</button>
              <button type="submit" class="btn btn-primary">${mode === 'create' ? '创建' : '保存'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.modalContainer.innerHTML = html;

    // 绑定表单提交
    document.querySelector('.admin-form').addEventListener('submit', e => {
      e.preventDefault();
      this.submitAdminForm(e.target);
    });

    // 非超级管理员才显示高级设置
    const roleSelect = document.querySelector('[name="role"]');
    const advancedSection = document.getElementById('advancedSection');
    if (roleSelect.value !== 'super_admin') {
      advancedSection.style.display = 'block';
    }

    roleSelect.addEventListener('change', () => {
      updateNodeRequirement(roleSelect);
      advancedSection.style.display = roleSelect.value === 'super_admin' ? 'none' : 'block';
      if (roleSelect.value === 'super_admin') {
        const showAdvanced = document.getElementById('showAdvanced');
        if (showAdvanced) showAdvanced.checked = false;
        document.getElementById('advancedContent').style.display = 'none';
      }
      loadAvailablePermissions(roleSelect.value);
    });

    if (roleSelect.value) {
      loadAvailablePermissions(roleSelect.value);
    }
  }

  /**
   * 打开调岗弹窗
   */
  openTransferModal(adminId, adminName, currentPosition) {
    const html = `
      <div class="admin-modal-overlay" onclick="this.closest('.admin-modal-overlay').remove()">
        <div class="admin-modal" onclick="event.stopPropagation()">
          <div class="admin-modal-header">
            <h3>调岗 - ${adminName}</h3>
            <span class="admin-modal-close" onclick="this.closest('.admin-modal-overlay').remove()">×</span>
          </div>
          <form class="admin-transfer-form" data-admin-id="${adminId}">
            <div class="form-group">
              <label>当前绑定</label>
              <input type="text" value="${currentPosition}" disabled style="background: #f5f5f5;" />
            </div>
            <div class="form-group">
              <label>目标角色 *</label>
              <select name="role" required onchange="updateNodeRequirement(this)">
                <option value="">-- 请选择 --</option>
                <option value="super_admin">超级管理员 (L0)</option>
                <option value="school_admin">学校管理员 (L1)</option>
                <option value="merchant_admin">商户管理员 (L2)</option>
                <option value="stall_admin">档口管理员 (L3)</option>
              </select>
            </div>
            <div class="form-group">
              <label>目标绑定 *</label>
              <input type="text" name="targetNode" placeholder="点击选择新的学校/商户/档口" readonly onclick="openNodeSelector(this)" class="node-input" required />
              <input type="hidden" name="school_id" />
              <input type="hidden" name="merchant_node_id" />
              <input type="hidden" name="stall_id" />
            </div>
            <div class="form-group">
              <label>调岗原因</label>
              <textarea name="reason" placeholder="可选：说明调岗原因（用于审计）" style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
            <div class="form-footer">
              <button type="button" class="btn btn-secondary" onclick="this.closest('.admin-modal-overlay').remove()">取消</button>
              <button type="submit" class="btn btn-primary">确认调岗</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.modalContainer.innerHTML = html;

    document.querySelector('.admin-transfer-form').addEventListener('submit', e => {
      e.preventDefault();
      this.submitTransferForm(e.target);
    });
  }

  /**
   * 打开权限审核弹窗（身份标签后缀审核）
   */
  openIdentitySuffixReviewModal(adminId, adminName, suffix) {
    const html = `
      <div class="admin-modal-overlay" onclick="this.closest('.admin-modal-overlay').remove()">
        <div class="admin-modal" onclick="event.stopPropagation()" style="max-width: 400px;">
          <div class="admin-modal-header">
            <h3>审核身份标签后缀</h3>
            <span class="admin-modal-close" onclick="this.closest('.admin-modal-overlay').remove()">×</span>
          </div>
          <form class="admin-review-form" data-admin-id="${adminId}">
            <div class="form-group">
              <label>管理员</label>
              <input type="text" value="${adminName}" disabled style="background: #f5f5f5;" />
            </div>
            <div class="form-group">
              <label>申请后缀</label>
              <input type="text" value="${suffix}" disabled style="background: #f5f5f5;" />
            </div>
            <div class="form-group">
              <label>审核意见</label>
              <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button type="button" class="btn btn-success" onclick="approveIdentitySuffix(${adminId})">
                  <i class="fas fa-check"></i> 通过
                </button>
                <button type="button" class="btn btn-danger" onclick="showRejectForm(${adminId})">
                  <i class="fas fa-times"></i> 拒绝
                </button>
              </div>
              <div id="rejectForm" style="display: none; margin-top: 10px;">
                <textarea id="rejectReason" placeholder="请说明拒绝原因..." style="width: 100%; height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                  <button type="button" class="btn btn-secondary" onclick="cancelReject()">取消</button>
                  <button type="button" class="btn btn-danger" onclick="rejectIdentitySuffix(${adminId})">确认拒绝</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    this.modalContainer.innerHTML = html;
  }

  /**
   * 提交管理员表单
   */
  submitAdminForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (data.realName) {
      data.real_name = data.realName;
      delete data.realName;
    }
    if (data.identityLabel) {
      data.identity_label = data.identityLabel;
      delete data.identityLabel;
    }
    if (data.identitySuffix) {
      data.identity_suffix = data.identitySuffix;
      delete data.identitySuffix;
    }

    console.log('提交管理员:', data);

    // 调用后端 API
    if (data.role !== 'super_admin' && !data.school_id && !data.merchant_node_id && !data.stall_id) {
      alert('请选择绑定节点');
      return;
    }

    const showAdvanced = document.getElementById('showAdvanced');
    if (showAdvanced?.checked) {
      data.permissions = Array.from(form.querySelectorAll('#permissionsCheckbox input[type="checkbox"]:checked'))
        .map(el => el.value);
    }

    fetch('/api/admin/management/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
        'X-Active-Position-Id': localStorage.getItem('adminActivePositionId')
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
      if (result.code && result.code !== 200) {
        alert('错误: ' + (result.message || '创建失败'));
      } else if (result.error) {
        alert('错误: ' + result.error);
      } else {
        alert('管理员创建成功！');
        form.closest('.admin-modal-overlay').remove();
        // 刷新列表
        location.reload();
      }
    })
    .catch(err => console.error(err));
  }

  /**
   * 提交调岗表单
   */
  submitTransferForm(form) {
    const adminId = form.dataset.adminId;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    console.log('提交调岗:', data);

    if (data.role !== 'super_admin' && !data.school_id && !data.merchant_node_id && !data.stall_id) {
      alert('请选择目标绑定节点');
      return;
    }

    fetch(`/api/admin/management/${adminId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
        'X-Active-Position-Id': localStorage.getItem('adminActivePositionId')
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
      if (result.code && result.code !== 200) {
        alert('错误: ' + (result.message || '调岗失败'));
      } else if (result.error) {
        alert('错误: ' + result.error);
      } else {
        alert('调岗成功！');
        form.closest('.admin-modal-overlay').remove();
        location.reload();
      }
    })
    .catch(err => console.error(err));
  }

  /**
   * 打开权限管理弹窗
   */
  openPermissionManageModal(adminId) {
    const html = `
      <div class="admin-modal-overlay" onclick="this.closest('.admin-modal-overlay').remove()">
        <div class="admin-modal" onclick="event.stopPropagation()">
          <div class="admin-modal-header">
            <h3>权限管理</h3>
            <span class="admin-modal-close" onclick="this.closest('.admin-modal-overlay').remove()">×</span>
          </div>
          <div class="admin-form">
            <div class="form-section" id="permissionManageContent">
              <div style="color:#999;">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalContainer.innerHTML = html;

    const token = localStorage.getItem('adminToken');
    const positionId = localStorage.getItem('adminActivePositionId');

    fetch(`/api/admin/management/${adminId}/detail`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Active-Position-Id': positionId
      }
    })
      .then(res => res.json())
      .then(async result => {
        const container = document.getElementById('permissionManageContent');
        if (!container) return;
        if (result.code && result.code !== 200) {
          container.innerHTML = `<div style="color:#ff4d4f;">${result.message || '加载失败'}</div>`;
          return;
        }

        const positions = result.data?.positions || [];
        if (positions.length === 0) {
          container.innerHTML = '<div style="color:#999;">暂无职位</div>';
          return;
        }

        const blocks = await Promise.all(positions.map(async (pos) => {
          const available = await fetchAvailablePermissions(pos.role);
          const current = pos.permissions || [];
          return renderPermissionBlock(pos, available, current);
        }));

        container.innerHTML = blocks.join('');

        container.querySelectorAll('.permission-save-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const posId = btn.getAttribute('data-position-id');
            const role = btn.getAttribute('data-role');
            const section = btn.closest('.permission-block');
            const currentPerms = (section.getAttribute('data-current') || '').split(',').filter(Boolean);
            const selected = Array.from(section.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value);

            const toGrant = selected.filter(p => !currentPerms.includes(p));
            const toRevoke = currentPerms.filter(p => !selected.includes(p));

            if (toGrant.length === 0 && toRevoke.length === 0) {
              alert('未发生变更');
              return;
            }

            const headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'X-Active-Position-Id': positionId
            };

            try {
              if (toGrant.length > 0) {
                const grantRes = await fetch(`/api/admin/management/${adminId}/permissions/grant`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ positionId: posId, permissions: toGrant })
                }).then(r => r.json());
                if (grantRes.code && grantRes.code !== 200) {
                  alert('授权失败：' + (grantRes.message || '请重试'));
                  return;
                }
              }

              if (toRevoke.length > 0) {
                const revokeRes = await fetch(`/api/admin/management/${adminId}/permissions/revoke`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ positionId: posId, permissions: toRevoke })
                }).then(r => r.json());
                if (revokeRes.code && revokeRes.code !== 200) {
                  alert('撤销失败：' + (revokeRes.message || '请重试'));
                  return;
                }
              }

              section.setAttribute('data-current', selected.join(','));
              alert('权限已更新');
            } catch (err) {
              alert('操作失败：' + err.message);
            }
          });
        });
      })
      .catch(err => {
        const container = document.getElementById('permissionManageContent');
        if (container) container.innerHTML = `<div style="color:#ff4d4f;">加载失败：${err.message}</div>`;
      });
  }

  /**
   * 打开管理员详情弹窗
   */
  openAdminDetailModal(adminId) {
    const html = `
      <div class="admin-modal-overlay" onclick="this.closest('.admin-modal-overlay').remove()">
        <div class="admin-modal" onclick="event.stopPropagation()">
          <div class="admin-modal-header">
            <h3>管理员详情</h3>
            <span class="admin-modal-close" onclick="this.closest('.admin-modal-overlay').remove()">×</span>
          </div>
          <div class="admin-form">
            <div class="form-section" id="adminDetailContent">
              <div style="color:#999;">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalContainer.innerHTML = html;

    const token = localStorage.getItem('adminToken');
    const positionId = localStorage.getItem('adminActivePositionId');

    Promise.all([
      fetch(`/api/admin/management/${adminId}/detail`, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'X-Active-Position-Id': positionId
        }
      }).then(res => res.json()),
      fetch(`/api/admin/management/audit-log?targetType=admin&targetId=${adminId}&days=90`, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'X-Active-Position-Id': positionId
        }
      }).then(res => res.json())
    ])
      .then(([detailResult, auditResult]) => {
        const container = document.getElementById('adminDetailContent');
        if (!container) return;
        if (detailResult.code && detailResult.code !== 200) {
          container.innerHTML = `<div style="color:#ff4d4f;">${detailResult.message || '加载失败'}</div>`;
          return;
        }

        const data = detailResult.data || {};
        const admin = data.admin || {};
        const positions = data.positions || [];
        const auditLogs = auditResult?.data || [];
        const formatTime = (val) => val ? new Date(val).toLocaleString('zh-CN') : '-';
        const roleLabel = (role) => {
          if (role === 'super_admin') return '超级管理员';
          if (role === 'school_admin') return '学校管理员';
          if (role === 'merchant_admin') return '商户管理员';
          if (role === 'stall_admin') return '档口管理员';
          return role || '-';
        };

        let positionHtml = '<div style="display:flex; flex-direction:column; gap:12px;">';
        if (positions.length === 0) {
          positionHtml += '<div style="color:#999;">暂无职位</div>';
        } else {
          positions.forEach(p => {
            const nodeName = p.stall_name || p.merchant_name || p.school_name || '平台';
            const permissions = (p.permissions || []).join('、') || '默认权限';
            positionHtml += `
              <div style="border:1px solid #eee; padding:10px; border-radius:4px;">
                <div><strong>${roleLabel(p.role)}</strong> · ${nodeName}</div>
                <div style="color:#666; font-size:12px; margin-top:6px;">权限：${permissions}</div>
                <div style="color:#999; font-size:12px; margin-top:4px;">任职：${formatTime(p.assigned_at)}${p.unassigned_at ? `（已卸任：${formatTime(p.unassigned_at)}）` : ''}</div>
              </div>
            `;
          });
        }
        positionHtml += '</div>';

        let auditHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
        if (!auditLogs || auditLogs.length === 0) {
          auditHtml += '<div style="color:#999;">近90天暂无记录</div>';
        } else {
          auditLogs.slice(0, 10).forEach(log => {
            auditHtml += `
              <div style="border:1px solid #eee; padding:8px; border-radius:4px;">
                <div><strong>${log.action}</strong> · ${log.target_type} #${log.target_id}</div>
                <div style="color:#999; font-size:12px; margin-top:4px;">${formatTime(log.created_at)}</div>
                ${log.reason ? `<div style=\"color:#999; font-size:12px; margin-top:4px;\">原因：${log.reason}</div>` : ''}
              </div>
            `;
          });
        }
        auditHtml += '</div>';

        container.innerHTML = `
          <div class="form-group">
            <label>用户名</label>
            <div>${admin.username || '-'}</div>
          </div>
          <div class="form-group">
            <label>姓名</label>
            <div>${admin.real_name || '-'}</div>
          </div>
          <div class="form-group">
            <label>身份标签</label>
            <div>${admin.identity_label || '-'} ${admin.identity_suffix ? ' / ' + admin.identity_suffix : ''}</div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <div>${admin.status || '-'}</div>
          </div>
          <div class="form-group">
            <label>手机号</label>
            <div>${admin.phone || '-'}</div>
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <div>${admin.email || '-'}</div>
          </div>
          <div class="form-group">
            <label>职位与权限</label>
            ${positionHtml}
          </div>
          <div class="form-group">
            <label>近90天操作记录</label>
            ${auditHtml}
          </div>
          <div class="form-group">
            <label>创建时间</label>
            <div>${formatTime(admin.created_at)}</div>
          </div>
        `;
      })
      .catch(err => {
        const container = document.getElementById('adminDetailContent');
        if (container) container.innerHTML = `<div style="color:#ff4d4f;">加载失败：${err.message}</div>`;
      });
  }

  /**
   * 打开管理员审计日志弹窗
   */
  openAuditLogModal(adminId) {
    const html = `
      <div class="admin-modal-overlay" onclick="this.closest('.admin-modal-overlay').remove()">
        <div class="admin-modal" onclick="event.stopPropagation()">
          <div class="admin-modal-header">
            <h3>操作日志</h3>
            <span class="admin-modal-close" onclick="this.closest('.admin-modal-overlay').remove()">×</span>
          </div>
          <div class="admin-form">
            <div class="form-section" id="adminAuditContent">
              <div style="color:#999;">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalContainer.innerHTML = html;

    fetch(`/api/admin/management/audit-log?targetType=admin&targetId=${adminId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
        'X-Active-Position-Id': localStorage.getItem('adminActivePositionId')
      }
    })
      .then(res => res.json())
      .then(result => {
        const container = document.getElementById('adminAuditContent');
        if (!container) return;
        if (result.code && result.code !== 200) {
          container.innerHTML = `<div style="color:#ff4d4f;">${result.message || '加载失败'}</div>`;
          return;
        }
        const logs = result.data || [];
        if (logs.length === 0) {
          container.innerHTML = '<div style="color:#999;">暂无日志</div>';
          return;
        }
        let listHtml = '<div style="display:flex; flex-direction:column; gap:10px;">';
        logs.forEach(log => {
          const time = log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '-';
          listHtml += `
            <div style="border:1px solid #eee; padding:10px; border-radius:4px;">
              <div><strong>${log.action}</strong> · ${log.target_type} #${log.target_id}</div>
              <div style="color:#666; font-size:12px; margin-top:4px;">操作人：${log.operator_id || '-'} / 职位：${log.operator_position_id || '-'}</div>
              <div style="color:#999; font-size:12px; margin-top:4px;">${time}</div>
              ${log.reason ? `<div style="color:#999; font-size:12px; margin-top:4px;">原因：${log.reason}</div>` : ''}
            </div>
          `;
        });
        listHtml += '</div>';
        container.innerHTML = listHtml;
      })
      .catch(err => {
        const container = document.getElementById('adminAuditContent');
        if (container) container.innerHTML = `<div style="color:#ff4d4f;">加载失败：${err.message}</div>`;
      });
  }
}

// 全局实例
const adminModalMgr = new AdminModalManager();

// 辅助函数
function updateNodeRequirement(selectEl) {
  const role = selectEl.value;
  const nodeGroup = document.getElementById('nodeGroup');
  const nodeInfo = document.getElementById('nodeInfo');
  const form = selectEl.closest('form');

  if (form) {
    const nodeInput = form.querySelector('.node-input');
    if (nodeInput) nodeInput.value = '';
    const schoolInput = form.querySelector('input[name="school_id"]');
    const merchantInput = form.querySelector('input[name="merchant_node_id"]');
    const stallInput = form.querySelector('input[name="stall_id"]');
    if (schoolInput) schoolInput.value = '';
    if (merchantInput) merchantInput.value = '';
    if (stallInput) stallInput.value = '';
  }

  if (role === 'super_admin') {
    nodeGroup.style.display = 'none';
    nodeInfo.textContent = '';
  } else if (role === 'school_admin') {
    nodeGroup.style.display = 'block';
    nodeInfo.textContent = '选择要管理的学校';
  } else if (role === 'merchant_admin') {
    nodeGroup.style.display = 'block';
    nodeInfo.textContent = '选择要管理的商户节点（含下级节点）';
  } else if (role === 'stall_admin') {
    nodeGroup.style.display = 'block';
    nodeInfo.textContent = '选择要管理的档口';
  }
}

function toggleAdvanced(checkbox) {
  document.getElementById('advancedContent').style.display = checkbox.checked ? 'block' : 'none';
}

function openNodeSelector(inputEl) {
  const form = inputEl.closest('form');
  const roleSelect = form?.querySelector('select[name="role"]');
  const role = roleSelect?.value;

  if (!role) {
    alert('请先选择角色');
    return;
  }
  if (role === 'super_admin') {
    alert('超级管理员无需绑定节点');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay';
  overlay.innerHTML = `
    <div class="admin-modal node-selector-modal" onclick="event.stopPropagation()">
      <div class="admin-modal-header">
        <h3>选择绑定节点</h3>
        <span class="admin-modal-close" onclick="this.closest('.admin-modal-overlay').remove()">×</span>
      </div>
      <div class="admin-form">
        <div class="form-section">
          <div class="node-selector-tip">当前角色：${role}</div>
          <div class="node-selector-search">
            <input type="text" id="nodeSelectorSearch" placeholder="搜索学校/商户/档口" />
          </div>
          <div id="nodeSelectorList" class="node-selector-list">加载中...</div>
        </div>
      </div>
    </div>
  `;

  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);

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
      const listEl = document.getElementById('nodeSelectorList');
      if (!listEl) return;
      if (!data.success || !Array.isArray(data.data)) {
        listEl.innerHTML = '<div style="color:#999;">加载失败</div>';
        return;
      }

      const nodes = flattenSelectableNodes(data.data);
      if (nodes.length === 0) {
        listEl.innerHTML = '<div style="color:#999;">暂无可选节点</div>';
        return;
      }

      const allowedType = role === 'school_admin' ? 'school' : role === 'merchant_admin' ? 'merchant' : 'stall';

      const renderList = (keyword = '') => {
        const normalized = keyword.trim().toLowerCase();
        const filtered = normalized
          ? nodes.filter(n => n.path.toLowerCase().includes(normalized))
          : nodes;

        listEl.innerHTML = filtered.map(n => {
          const disabled = n.type !== allowedType ? 'disabled' : '';
          const indent = n.depth * 18;
          return `
            <div class="node-selector-item ${disabled}" style="padding-left: ${indent}px" data-type="${n.type}" data-path="${n.path}" data-school-id="${n.school_id || ''}" data-merchant-id="${n.merchant_node_id || ''}" data-stall-id="${n.stall_id || ''}">
              <span class="node-selector-label">${n.path}</span>
            </div>
          `;
        }).join('') || '<div style="color:#999; padding:8px 12px;">未找到匹配节点</div>';

        listEl.querySelectorAll('.node-selector-item').forEach(item => {
          if (item.classList.contains('disabled')) return;
          item.addEventListener('click', () => {
            const path = item.getAttribute('data-path');
            const schoolId = item.getAttribute('data-school-id');
            const merchantId = item.getAttribute('data-merchant-id');
            const stallId = item.getAttribute('data-stall-id');

            inputEl.value = path;
            const schoolInput = form.querySelector('input[name="school_id"]');
            const merchantInput = form.querySelector('input[name="merchant_node_id"]');
            const stallInput = form.querySelector('input[name="stall_id"]');
            if (schoolInput) schoolInput.value = schoolId || '';
            if (merchantInput) merchantInput.value = merchantId || '';
            if (stallInput) stallInput.value = stallId || '';

            overlay.remove();
          });
        });
      };

      renderList('');

      const searchInput = document.getElementById('nodeSelectorSearch');
      if (searchInput) {
        searchInput.addEventListener('input', () => renderList(searchInput.value));
      }
    })
    .catch(err => {
      const listEl = document.getElementById('nodeSelectorList');
      if (listEl) listEl.innerHTML = `<div style="color:#ff4d4f;">加载失败：${err.message}</div>`;
    });
}

async function fetchAvailablePermissions(role) {
  if (!role || role === 'super_admin') return [];
  const token = localStorage.getItem('adminToken');
  const positionId = localStorage.getItem('adminActivePositionId');
  try {
    const res = await fetch(`/api/admin/management/permissions/available?role=${encodeURIComponent(role)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Active-Position-Id': positionId
      }
    });
    const data = await res.json();
    if (data.code && data.code !== 200) return [];
    return data.data?.available || [];
  } catch (err) {
    return [];
  }
}

function loadAvailablePermissions(role) {
  const container = document.getElementById('permissionsCheckbox');
  if (!container) return;
  if (!role || role === 'super_admin') {
    container.innerHTML = '<div style="color:#999; font-size:12px;">超级管理员无需自定义权限</div>';
    return;
  }

  container.innerHTML = '<div style="color:#999; font-size:12px;">加载中...</div>';
  fetchAvailablePermissions(role).then(perms => {
    if (!perms || perms.length === 0) {
      container.innerHTML = '<div style="color:#999; font-size:12px;">暂无可授予权限</div>';
      return;
    }
    container.innerHTML = perms.map(p => {
      return `
        <div class="permission-item">
          <input type="checkbox" id="perm_${p}" value="${p}" />
          <label for="perm_${p}">${p}</label>
        </div>
      `;
    }).join('');
  });
}

function renderPermissionBlock(position, available, current) {
  const roleLabel = (role) => {
    if (role === 'super_admin') return '超级管理员';
    if (role === 'school_admin') return '学校管理员';
    if (role === 'merchant_admin') return '商户管理员';
    if (role === 'stall_admin') return '档口管理员';
    return role || '-';
  };
  const nodeName = position.stall_name || position.merchant_name || position.school_name || '平台';
  const list = (available || []).map(p => {
    const checked = current.includes(p) ? 'checked' : '';
    return `
      <div class="permission-item">
        <input type="checkbox" id="perm_${position.id}_${p}" value="${p}" ${checked} />
        <label for="perm_${position.id}_${p}">${p}</label>
      </div>
    `;
  }).join('');

  const empty = '<div style="color:#999; font-size:12px;">暂无可授予权限</div>';

  return `
    <div class="permission-block" data-current="${current.join(',')}">
      <div style="font-weight:600; margin-bottom:8px;">${roleLabel(position.role)} · ${nodeName}</div>
      <div class="permission-grid">
        ${list || empty}
      </div>
      <div style="margin-top:12px; text-align:right;">
        <button type="button" class="btn btn-primary permission-save-btn" data-position-id="${position.id}" data-role="${position.role}">保存</button>
      </div>
    </div>
  `;
}

function flattenSelectableNodes(tree) {
  const result = [];

  const traverse = (nodes, depth = 0, path = [], context = {}) => {
    if (!nodes) return;
    nodes.forEach(node => {
      if (node.type === 'school') {
        const nextPath = [...path, node.name];
        result.push({
          type: 'school',
          depth,
          path: nextPath.join(' / '),
          school_id: node.id
        });
        traverse(node.children || [], depth + 1, nextPath, { school_id: node.id });
      }
      if (node.type === 'merchant') {
        const nextPath = [...path, node.name];
        result.push({
          type: 'merchant',
          depth,
          path: nextPath.join(' / '),
          school_id: context.school_id,
          merchant_node_id: node.id
        });
        traverse(node.children || [], depth + 1, nextPath, { school_id: context.school_id, merchant_node_id: node.id });
      }
      if (node.type === 'stall') {
        const nextPath = [...path, node.name];
        result.push({
          type: 'stall',
          depth,
          path: nextPath.join(' / '),
          school_id: context.school_id,
          merchant_node_id: context.merchant_node_id,
          stall_id: node.id
        });
      }
      if (node.type === 'unassigned') {
        return;
      }
    });
  };

  traverse(tree);
  return result;
}

function approveIdentitySuffix(adminId) {
  fetch(`/api/admin/management/${adminId}/approve-suffix`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
      'X-Active-Position-Id': localStorage.getItem('adminActivePositionId')
    },
    body: JSON.stringify({ approved: true })
  })
  .then(res => res.json())
  .then(result => {
    if (result.code && result.code !== 200) {
      alert('审核失败：' + (result.message || '请重试'));
      return;
    }
    alert('已通过！');
    document.querySelector('.admin-modal-overlay').remove();
    location.reload();
  });
}

function showRejectForm(adminId) {
  document.getElementById('rejectForm').style.display = 'block';
}

function cancelReject() {
  document.getElementById('rejectForm').style.display = 'none';
}

function rejectIdentitySuffix(adminId) {
  const reason = document.getElementById('rejectReason').value;
  if (!reason.trim()) {
    alert('请输入拒绝原因');
    return;
  }

  fetch(`/api/admin/management/${adminId}/approve-suffix`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
      'X-Active-Position-Id': localStorage.getItem('adminActivePositionId')
    },
    body: JSON.stringify({ approved: false, rejectReason: reason })
  })
  .then(res => res.json())
  .then(result => {
    if (result.code && result.code !== 200) {
      alert('审核失败：' + (result.message || '请重试'));
      return;
    }
    alert('已拒绝！');
    document.querySelector('.admin-modal-overlay').remove();
    location.reload();
  });
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdminModalManager, adminModalMgr };
}
