
class GitHubSubmitter {
    constructor() {
        this.config = this.loadConfig();
        this.currentFile = null;
        this.initEventListeners();
        this.updateUI();
    }

    loadConfig() {
        const saved = localStorage.getItem('githubConfig');
        return saved ? JSON.parse(saved) : {
            repoOwner: '',
            repoName: '',
            authMethod: 'token',
            githubToken: ''
        };
    }

    saveConfig() {
        localStorage.setItem('githubConfig', JSON.stringify(this.config));
    }

    initEventListeners() {
        // 配置保存
        document.getElementById('saveConfig').addEventListener('click', () => this.handleSaveConfig());
        
        // 文件选择
        document.getElementById('selectFile').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 提交按钮
        document.getElementById('submitToGitHub').addEventListener('click', () => this.handleSubmit());
        
        // 认证方式切换
        document.getElementById('authMethod').addEventListener('change', (e) => this.handleAuthMethodChange(e));
    }

    handleSaveConfig() {
        this.config.repoOwner = document.getElementById('repoOwner').value.trim();
        this.config.repoName = document.getElementById('repoName').value.trim();
        this.config.authMethod = document.getElementById('authMethod').value;
        this.config.githubToken = document.getElementById('githubToken').value.trim();

        if (!this.config.repoOwner || !this.config.repoName) {
            this.showStatus('请填写完整的仓库信息', 'error');
            return;
        }

        this.saveConfig();
        this.showStatus('配置保存成功', 'success');
        this.updateUI();
    }

    handleAuthMethodChange(e) {
        const tokenInput = document.getElementById('tokenInput');
        if (e.target.value === 'ssh') {
            tokenInput.classList.add('hidden');
        } else {
            tokenInput.classList.remove('hidden');
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件大小（GitHub限制25MB）
        if (file.size > 25 * 1024 * 1024) {
            this.showStatus('文件大小超过25MB限制，请选择较小的文件', 'error');
            return;
        }

        this.currentFile = file;
        document.getElementById('fileName').textContent = `已选择文件: ${file.name} (${this.formatFileSize(file.size)})`;
        document.getElementById('fileInfo').classList.remove('hidden');
        
        // 自动填充文件路径
        const filePathInput = document.getElementById('filePath');
        if (!filePathInput.value) {
            filePathInput.value = `records/${file.name}`;
        }

        this.showStatus('文件选择成功，请继续提交操作', 'success');
        this.updateUI();
    }

    async handleSubmit() {
        if (!this.validateSubmit()) return;

        const submitBtn = document.getElementById('submitToGitHub');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交中...';
        submitBtn.disabled = true;

        try {
            await this.submitToGitHub();
            this.showStatus('文件成功提交到GitHub仓库', 'success');
            this.addToHistory('success');
        } catch (error) {
            console.error('提交失败:', error);
            this.showStatus(`提交失败: ${error.message}`, 'error');
            this.addToHistory('error', error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateSubmit() {
        if (!this.config.repoOwner || !this.config.repoName) {
            this.showStatus('请先配置GitHub仓库信息', 'error');
            return false;
        }

        if (this.config.authMethod === 'token' && !this.config.githubToken) {
            this.showStatus('请配置GitHub个人访问令牌', 'error');
            return false;
        }

        if (!this.currentFile) {
            this.showStatus('请先选择要提交的文件', 'error');
            return false;
        }

        const commitMessage = document.getElementById('commitMessage').value.trim();
        if (!commitMessage) {
            this.showStatus('请输入提交说明', 'error');
            return false;
        }

        return true;
    }

    async submitToGitHub() {
        const commitMessage = document.getElementById('commitMessage').value.trim();
        const filePath = document.getElementById('filePath').value.trim();

        // 读取文件内容
        const fileContent = await this.readFileAsBase64(this.currentFile);

        // 构建API请求
        const apiUrl = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${filePath}`;

        const requestBody = {
            message: commitMessage,
            content: fileContent,
            branch: 'main'
        };

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.config.githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // 移除data URL前缀
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        const statusText = document.getElementById('statusText');

        statusText.textContent = message;
        statusElement.className = `p-4 rounded-lg border ${
            type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
            'bg-blue-50 border-blue-200 text-blue-700'
        }`;

        statusElement.classList.remove('hidden');
        
        // 5秒后自动隐藏
        setTimeout(() => {
            statusElement.classList.add('hidden');
        }, 5000);
    }

    addToHistory(status, errorMessage = '') {
        const historyContainer = document.getElementById('commitHistory');
        
        // 清除初始提示
        if (historyContainer.querySelector('.text-center')) {
            historyContainer.innerHTML = '';
        }

        const historyItem = document.createElement('div');
        historyItem.className = `p-3 rounded-lg border ${
            status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`;

        const timestamp = new Date().toLocaleString();
        const fileName = this.currentFile.name;
        const commitMsg = document.getElementById('commitMessage').value;

        historyItem.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="font-medium ${status === 'success' ? 'text-green-700' : 'text-red-700'}">
                <i class="fas ${status === 'success' ? 'fa-check' : 'fa-times'} mr-2"></i>
                ${status === 'success' ? '提交成功' : '提交失败'}
            </p>
            <p class="text-sm text-gray-600 mt-1">${commitMsg}</p>
            <p class="text-xs text-gray-500 mt-1">文件: ${fileName} | 时间: ${timestamp}</p>
            ${errorMessage ? `<p class="text-xs text-red-600 mt-1">错误: ${errorMessage}</p>
            </div>
        `;

        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    }

    updateUI() {
        const submitBtn = document.getElementById('submitToGitHub');
        const hasConfig = this.config.repoOwner && this.config.repoName;
        const hasFile = this.currentFile !== null;

        // 填充配置表单
        document.getElementById('repoOwner').value = this.config.repoOwner || '';
        document.getElementById('repoName').value = this.config.repoName || '';
        document.getElementById('authMethod').value = this.config.authMethod || 'token';
        document.getElementById('githubToken').value = this.config.githubToken || '';

        // 更新提交按钮状态
        submitBtn.disabled = !(hasConfig && hasFile);

        // 处理认证方式显示
        this.handleAuthMethodChange({ target: document.getElementById('authMethod') });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GitHubSubmitter();
});

// 拖拽上传功能
document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.querySelector('#upload .border-dashed');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            const fileInput = document.getElementById('fileInput');
            fileInput.files = files;
            
            // 触发change事件
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }
});
