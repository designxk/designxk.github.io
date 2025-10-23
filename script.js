
class GitHubFormHandler {
    constructor() {
        this.submissions = JSON.parse(localStorage.getItem('githubSubmissions')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSubmissions();
    }

    bindEvents() {
        const form = document.getElementById('contentForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交中...';
            submitBtn.disabled = true;

            const formData = this.getFormData();
            await this.validateFormData(formData);
            
            const result = await this.submitToGitHub(formData);
            this.handleSuccess(result, formData);
            
        } catch (error) {
            this.handleError(error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

    getFormData() {
        return {
            repoOwner: document.getElementById('repoOwner').value.trim(),
            repoName: document.getElementById('repoName').value.trim(),
            filePath: document.getElementById('filePath').value.trim(),
            githubToken: document.getElementById('githubToken').value.trim(),
            title: document.getElementById('title').value.trim(),
            content: document.getElementById('content').value.trim(),
            appendMode: document.getElementById('appendMode').checked
        };
    }

    async validateFormData(data) {
        const required = ['repoOwner', 'repoName', 'filePath', 'githubToken', 'title', 'content'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`请填写以下必填字段: ${missing.join(', ')}`);
        }

        if (data.githubToken.length < 10) {
            throw new Error('GitHub Token格式不正确');
        }
    }

    async submitToGitHub(formData) {
        const timestamp = new Date().toISOString();
        const commitMessage = `提交新内容: ${formData.title} - ${timestamp}`;
        
        let fileContent = '';
        
        if (formData.appendMode) {
            try {
                const existingContent = await this.getExistingFile(formData);
                fileContent = existingContent + `\n\n--- 新提交 ${timestamp} ---\n标题: ${formData.title}\n内容: ${formData.content}\n`;
            } catch (error) {
                fileContent = `标题: ${formData.title}\n内容: ${formData.content}\n提交时间: ${timestamp}\n`;
            }
        } else {
            fileContent = `标题: ${formData.title}\n内容: ${formData.content}\n提交时间: ${timestamp}\n`;
        }

        const payload = {
            message: commitMessage,
            content: btoa(unescape(encodeURIComponent(fileContent)))
        };

        if (formData.appendMode) {
            const existingFile = await this.getExistingFileInfo(formData);
            if (existingFile) {
                payload.sha = existingFile.sha;
            }
        }

        const response = await fetch(
            `https://api.github.com/repos/${formData.repoOwner}/${formData.repoName}/contents/${formData.filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${formData.githubToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '提交失败');
        }

        return await response.json();
    }

    async getExistingFileInfo(formData) {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${formData.repoOwner}/${formData.repoName}/contents/${formData.filePath}`,
                {
                    headers: {
                        'Authorization': `token ${formData.githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    async getExistingFile(formData) {
        const fileInfo = await this.getExistingFileInfo(formData);
        if (fileInfo && fileInfo.content) {
            return decodeURIComponent(escape(atob(fileInfo.content)));
        }
        return '';
    }

    handleSuccess(result, formData) {
        const submission = {
            id: Date.now(),
            title: formData.title,
            timestamp: new Date().toISOString(),
            commitSha: result.commit.sha,
            fileUrl: result.content.html_url
        };

        this.submissions.unshift(submission);
        this.saveSubmissions();
        this.updateStatusArea();
        this.showNotification('提交成功！内容已保存到GitHub仓库', 'success');
        
        document.getElementById('contentForm').reset();
    }

    handleError(error) {
        console.error('提交错误:', error);
        this.showNotification(`提交失败: ${error.message}`, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        } z-50`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle'
                } mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    saveSubmissions() {
        localStorage.setItem('githubSubmissions', JSON.stringify(this.submissions));
    }

    loadSubmissions() {
        this.updateStatusArea();
    }

    updateStatusArea() {
        const statusArea = document.getElementById('statusArea');
        
        if (this.submissions.length === 0) {
            statusArea.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-history text-4xl mb-4"></i>
                    <p>暂无提交记录</p>
                </div>
            `;
            return;
        }

        statusArea.innerHTML = this.submissions.map(sub => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-800">${sub.title}</h4>
                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    ${new Date(sub.timestamp).toLocaleString('zh-CN')}
                </span>
            </div>
            <div class="text-sm text-gray-600 flex justify-between">
                <span>提交ID: ${sub.id}</span>
                <a href="${sub.fileUrl}" target="_blank" class="text-purple-600 hover:text-purple-700">
                <i class="fas fa-external-link-alt mr-1"></i>查看文件
            </a>
        </div>
    </div>
`).join('');
}
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
new GitHubFormHandler();

// 添加快捷键支持
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('contentForm').dispatchEvent(new Event('submit'));
    }
});
