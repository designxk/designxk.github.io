<code_start project_name=小凯工业设计官网 filename=github-submit.js title=GitHub API表单提交处理 entrypoint=false runnable=false project_final_file=false>
/**
 * GitHub API 表单提交处理
 * 请将以下信息替换为您的实际信息：
 * - [您的用户名]：替换为您的GitHub用户名
 * - [您的个人令牌]：替换为您的GitHub个人访问令牌
 */

class GitHubFormSubmitter {
    constructor(username, token, repo = 'designxk/date') {
        this.username = username;
        this.token = token;
        this.repo = repo;
        this.baseURL = 'https://api.github.com';
    }

    async submitFormData(formData) {
        try {
            // 生成唯一的文件名
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `consultation-${timestamp}.txt`;
            
            const response = await fetch(`${this.baseURL}/repos/${this.username}/${this.repo}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `咨询提交：${formData.name} - ${formData.company}`,
                    content: btoa(JSON.stringify(formData, null, 2)),
                    branch: 'main'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('文件创建成功:', result.content.html_url);
                return { success: true, data: result };
            } else {
                const error = await response.json();
                console.error('提交失败:', error);
                return { success: false, error: error };
            }
        } catch (error) {
            console.error('网络错误:', error);
            return { success: false, error: error };
        }
    }

    async checkRepoExists() {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.username}/${this.repo}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// 使用示例
const submitter = new GitHubFormSubmitter('designxk', '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');

// 表单提交事件处理
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultationForm');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // 显示加载状态
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交中...';
        submitButton.disabled = true;
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            company: formData.get('company'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            source: '小凯工业设计官网'
        };
        
        const result = await submitter.submitFormData(data);
        
        // 恢复按钮状态
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        if (result.success) {
            alert('咨询提交成功！我们将尽快与您联系。');
            form.reset();
        } else {
            alert('提交失败，请稍后重试或直接拨打我们的电话。');
        }
    });
});
<code_end>

