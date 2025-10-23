
class GitHubFormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('submitForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '提交中...';
            submitBtn.disabled = true;

            const formData = this.getFormData();
            await this.validateFormData(formData);
            
            const result = await this.submitToGitHub(formData);
            this.handleSuccess();
            
        } catch (error) {
            this.handleError(error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim()
        };
    }

    async validateFormData(data) {
        if (!data.name) {
            throw new Error('请输入姓名');
        }

        if (!data.phone) {
            throw new Error('请输入联系电话');
        }

        const phoneRegex = /-9]\d{9}$/;
        if (!phoneRegex.test(data.phone)) {
            throw new Error('请输入正确的手机号码');
        }
    }

    async submitToGitHub(formData) {
        const timestamp = new Date().toISOString();
        const content = `姓名: ${formData.name}\n电话: ${formData.phone}\n提交时间: ${timestamp}\n`;
        
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        const payload = {
            message: `新提交: ${formData.name} - ${timestamp}`,
            content: encodedContent
        };

        const response = await fetch(
            'https://api.github.com/repos/designxk/designxk/contents/submissions/data.txt',
            {
                method: 'PUT',
                headers: {
                    'Authorization': 'token my bash script',
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '提交失败，请稍后重试');
        }

        return await response.json();
    }

    handleSuccess() {
        this.showSuccessMessage();
        document.getElementById('submitForm').reset();
    }

    handleError(error) {
        alert(error.message);
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GitHubFormHandler();
});
