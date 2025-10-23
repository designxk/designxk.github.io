
// GitHub配置信息
const GITHUB_CONFIG = {
    owner: 'designxk', // 替换为您的GitHub用户名
    repo: 'date',   // 替换为您的仓库名
    path: 'submissions/data.json',    // 数据保存路径
    token: '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'       // 替换为您的GitHub个人访问令牌
};

// DOM元素
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const nameError = document.getElementById('nameError');
const phoneError = document.getElementById('phoneError');
const loading = document.getElementById('loading');
const successModal = document.getElementById('successModal');
const historyList = document.getElementById('historyList');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSubmissionHistory();
    setupFormValidation();
});

// 设置表单验证
function setupFormValidation() {
    // 实时验证
    nameInput.addEventListener('blur', validateName);
    phoneInput.addEventListener('blur', validatePhone);
    
    // 表单提交事件
    contactForm.addEventListener('submit', handleFormSubmit);
}

// 验证姓名
function validateName() {
    const name = nameInput.value.trim();
    
    if (!name) {
        showError(nameError, '姓名不能为空');
        return false;
    }
    
    if (name.length < 2) {
        showError(nameError, '姓名至少需要2个字符');
        return false;
    }
    
    hideError(nameError);
    return true;
}

// 验证电话
function validatePhone() {
    const phone = phoneInput.value.trim();
    const phoneRegex = /-9]\d{9}$|\d{2,3}-?\d{7,8}$/;
    
    if (!phone) {
        showError(phoneError, '电话不能为空');
        return false;
    }
    
    if (!phoneRegex.test(phone)) {
        showError(phoneError, '请输入有效的电话号码');
        return false;
    }
    
    hideError(phoneError);
    return true;
}

// 显示错误信息
function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// 隐藏错误信息
function hideError(errorElement) {
    errorElement.style.display = 'none';
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // 验证所有字段
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    
    if (!isNameValid || !isPhoneValid) {
        return;
    }
    
    const formData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        timestamp: new Date().toISOString(),
        id: generateId()
    };
    
    try {
        showLoading();
        await saveToGitHub(formData);
        showSuccess();
        updateSubmissionHistory(formData);
        resetForm();
    } catch (error) {
        console.error('提交失败:', error);
        alert('提交失败，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 保存数据到GitHub
async function saveToGitHub(formData) {
    // 获取现有数据
    let existingData = [];
    
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        const content = atob(response.data.content);
        existingData = JSON.parse(content);
    } catch (error) {
        // 如果文件不存在，创建新文件
        if (error.response && error.response.status === 404) {
            existingData = [];
        } else {
            throw error;
        }
    }
    
    // 添加新数据
    existingData.push(formData);
    
    // 更新文件
    const content = btoa(JSON.stringify(existingData, null, 2));
    
    let sha;
    try {
        const getResponse = await axios.get(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`
            }
        );
        sha = getResponse.data.sha;
    } catch (error) {
        // 文件不存在，不需要sha
    }
    
    const updateData = {
        message: `添加新的表单提交: ${formData.name}`,
        content: content,
        sha: sha || undefined
    };
    
    const response = await axios.put(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
        updateData,
        {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    
    return response.data;
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 加载提交历史
async function loadSubmissionHistory() {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        const content = atob(response.data.content);
        const submissions = JSON.parse(content);
        
        // 显示最近5条记录
        const recentSubmissions = submissions.slice(-5).reverse();
        displayHistory(recentSubmissions);
    } catch (error) {
        // 如果文件不存在或获取失败，显示空状态
        historyList.innerHTML = '<p class="no-history">暂无提交记录</p>';
    }
}

// 显示历史记录
function displayHistory(submissions) {
    if (submissions.length === 0) {
        historyList.innerHTML = '<p class="no-history">暂无提交记录</p>';
    return;
}

historyList.innerHTML = submissions.map(submission => `
    <div class="history-item">
        <div class="history-item-header">
            <span class="history-name">${escapeHtml(submission.name)}</span>
            <span class="history-time">${formatDate(submission.timestamp)}</span>
        </div>
        <div class="history-phone">${escapeHtml(submission.phone)}</div>
    </div>
`).join('');
}

// 更新提交历史
function updateSubmissionHistory(formData) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-item-header">
            <span class="history-name">${escapeHtml(formData.name)}</span>
            <span class="history-time">${formatDate(formData.timestamp)}</span>
        </div>
        <div class="history-phone">${escapeHtml(formData.phone)}</div>
    </div>
`;
    
    // 添加到列表顶部
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // 如果超过5条，移除最旧的
    if (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
    }
    
    // 移除"暂无提交记录"提示
    const noHistory = historyList.querySelector('.no-history');
    if (noHistory) {
        noHistory.remove();
    }
}

// 重置表单
function resetForm() {
    contactForm.reset();
    hideError(nameError);
    hideError(phoneError);
}

// 显示加载动画
function showLoading() {
    loading.classList.remove('hidden');
}

// 隐藏加载动画
function hideLoading() {
    loading.classList.add('hidden');
}

// 显示成功提示
function showSuccess() {
    successModal.classList.remove('hidden');
}

// 关闭模态框
function closeModal() {
    successModal.classList.add('hidden');
}

// 格式化日期
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 键盘快捷键支持
document.addEventListener('keydown', function(event) {
    // Ctrl + Enter 提交表单
    if (event.ctrlKey && event.key === 'Enter') {
        contactForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape 关闭模态框
    if (event.key === 'Escape') {
        closeModal();
    }
});



