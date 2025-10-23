<code_start project_name=GitHub数据提交系统 filename=script.js title=数据处理逻辑 entrypoint=false runnable=false project_final_file=false>
// GitHub配置信息 - 请根据实际情况修改这些配置
const GITHUB_CONFIG = {
    token: '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',  // 替换为您的GitHub个人访问令牌
    owner: 'designxk',                 // 替换为您的GitHub用户名
    repo: 'date',                 // 替换为您的仓库名称
    filePath: 'date/data/submissions.json'       // 数据存储路径
};

// 本地存储键名
const STORAGE_KEYS = {
    submissions: 'github_submissions',
    stats: 'github_submission_stats'
};

class GitHubSubmissionSystem {
    constructor() {
        this.submissions = this.loadFromLocalStorage();
        this.initializeEventListeners();
        this.updateUI();
    }

    // 初始化事件监听器
    initializeEventListeners() {
        const form = document.getElementById('dataForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // 输入实时验证
        document.getElementById('phone').addEventListener('input', (e) => {
            this.validatePhone(e.target);
        });
    }

    // 处理表单提交
    async handleSubmit(event) {
        event.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // 获取表单数据
        const submission = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            timestamp: new Date().toISOString(),
            id: this.generateId()
        };

        // 验证数据
        if (!this.validateSubmission(submission)) {
            return;
        }

        // 禁用提交按钮并显示加载状态
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交中...';

        try {
            // 保存到GitHub
            await this.saveToGitHub(submission);
            
            // 保存到本地存储
            this.addSubmission(submission);
            
            // 更新UI
            this.updateUI();
            
            // 显示成功消息
            this.showMessage('提交成功！数据已保存到GitHub仓库。', 'success');
            
            // 重置表单
            document.getElementById('dataForm').reset();
            
        } catch (error) {
            console.error('提交失败：', error);
            this.showMessage('提交失败：' + (error.message || '请检查网络连接和GitHub配置'), 'error');
        } finally {
            // 恢复提交按钮
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // 验证提交数据
    validateSubmission(submission) {
        if (!submission.name) {
            this.showMessage('请输入姓名', 'error');
            return false;
        }

        if (!submission.phone) {
            this.showMessage('请输入电话号码', 'error');
            return false;
        }

        if (!this.isValidPhone(submission.phone)) {
            this.showMessage('请输入有效的电话号码', 'error');
            return false;
        }

        return true;
    }

    // 验证电话号码
    isValidPhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$|^(0\d{2,3}-?)?\d{7,8}$/;
        return phoneRegex.test(phone);
    }

    // 实时验证电话号码
    validatePhone(input) {
        const phone = input.value.trim();
        if (phone && !this.isValidPhone(phone)) {
            input.classList.add('border-red-500');
        } else {
            input.classList.remove('border-red-500');
        }
    }

    // 保存数据到GitHub
    async saveToGitHub(newSubmission) {
        try {
            // 获取现有文件内容
            const existingContent = await this.getGitHubFileContent();
            const dataArray = existingContent ? JSON.parse(existingContent) : [];
            
            // 添加新提交
            dataArray.push(newSubmission);
            
            // 更新文件
            await this.updateGitHubFile(JSON.stringify(dataArray, null, 2));
            
        } catch (error) {
            throw new Error(`GitHub保存失败: ${error.message}`);
        }
    }

    // 获取GitHub文件内容
    async getGitHubFileContent() {
        const { owner, repo, filePath, token } = GITHUB_CONFIG;
        
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, 
            {
                headers: { 
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (response.status === 200) {
            const data = await response.json();
            return atob(data.content.replace(/\n/g, ''));
        } else if (response.status === 404) {
            return null; // 文件不存在
        } else {
            throw new Error(`获取文件失败: ${response.status}`);
        }
    }

    // 更新GitHub文件
    async updateGitHubFile(content) {
        const { owner, repo, filePath, token } = GITHUB_CONFIG;
        
        // 获取文件SHA（如果存在）
        let sha = null;
        try {
            const fileInfo = await this.getGitHubFileContent();
            if (fileInfo) {
                const fileResponse = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
                    {
                        headers: { 'Authorization': `token ${token}` }
                    }
                );
                if (fileResponse.status === 200) {
                    const fileData = await fileResponse.json();
                    sha = fileData.sha;
            }
        } catch (error) {
            // 文件不存在，继续创建新文件
        }

        // 更新文件
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `添加新的提交记录 - ${new Date().toLocaleString()}`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: sha
                })
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '文件更新失败');
        }
    }

    // 添加提交记录
    addSubmission(submission) {
        this.submissions.unshift(submission); // 添加到开头
        this.saveToLocalStorage();
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 保存到本地存储
    saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(this.submissions));
        
        // 更新统计信息
        const stats = this.calculateStats();
        localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    }

    // 从本地存储加载
    loadFromLocalStorage() {
        const stored = localStorage.getItem(STORAGE_KEYS.submissions);
        return stored ? JSON.parse(stored) : [];
    }

    // 计算统计信息
    calculateStats() {
        const today = new Date().toDateString();
        const todayCount = this.submissions.filter(sub => 
            new Date(sub.timestamp).toDateString() === today
        ).length;

        return {
            totalCount: this.submissions.length,
            todayCount: todayCount,
            lastSubmit: this.submissions.length > 0 ? 
                new Date(this.submissions[0].timestamp).toLocaleString() : '暂无'
        };
    }

    // 更新UI
    updateUI() {
        this.updateStats();
        this.updateRecentSubmissions();
        this.updateHistoryTable();
    }

    // 更新统计信息
    updateStats() {
        const stats = this.calculateStats();
        
        document.getElementById('totalCount').textContent = stats.totalCount;
        document.getElementById('todayCount').textContent = stats.todayCount;
        document.getElementById('lastSubmit').textContent = stats.lastSubmit;
    }

    // 更新最近提交
    updateRecentSubmissions() {
        const container = document.getElementById('recentSubmissions');
        const recent = this.submissions.slice(0, 5);
        
        if (recent.length === 0) {
            container.innerHTML = '<div class="text-center text-white/60 py-4">暂无提交记录</div>';
            return;
        }

        container.innerHTML = recent.map(sub => `
            <div class="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span class="font-medium">${sub.name}</span>
                <span class="text-sm text-white/70">${new Date(sub.timestamp).toLocaleTimeString()}</span>
            </div>
        `).join('');
    }

    // 更新历史表格
    updateHistoryTable() {
        const tableBody = document.getElementById('historyTable');
        
        if (this.submissions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <div>暂无提交记录</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.submissions.map(sub => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4">${sub.name}</td>
                <td class="py-3 px-4">${sub.phone}</td>
                <td class="py-3 px-4 text-sm text-gray-500">
                    ${new Date(sub.timestamp).toLocaleString()}
                </td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <i class="fas fa-check mr-1"></i>已提交
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('message');
        messageEl.className = `mt-6 p-4 rounded-lg ${
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        messageEl.textContent = message;
        messageEl.classList.remove('hidden');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }
}

// 页面加载完成后初始化系统
document.addEventListener('DOMContentLoaded', () => {
    new GitHubSubmissionSystem();
});

// 导出供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubSubmissionSystem;
}
<code_end>


