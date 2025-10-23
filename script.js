
// GitHub配置 - 请替换为您的实际信息
const GITHUB_CONFIG = {
    username: 'designxk',
    repository: 'designxk',
    token: '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' // 需要repo权限
};

class FormValidator {
    constructor() {
        this.nameRegex = /\u4e00-\u9fa5a-zA-Z\s]{2,20}$/;
        this.phoneRegex = /-9]\d{9}$/;
        this.emailRegex = /\s@]+@[^\s@]+\.[^\s@]+$/;
    }

    validateName(name) {
        if (!name.trim()) {
            return { isValid: false, message: '姓名不能为空' };
        }
        if (!this.nameRegex.test(name)) {
            return { isValid: false, message: '姓名格式不正确（2-20个字符）' };
        }
        return { isValid: true, message: '' };
    }

    validatePhone(phone) {
        if (!phone.trim()) {
            return { isValid: false, message: '电话号码不能为空' };
        }
        if (!this.phoneRegex.test(phone)) {
            return { isValid: false, message: '请输入正确的手机号码格式' };
        }
        return { isValid: true, message: '' };
    }

    validateEmail(email) {
        if (email && !this.emailRegex.test(email)) {
            return { isValid: false, message: '邮箱格式不正确' };
        }
        return { isValid: true, message: '' };
    }
}

class GitHubService {
    constructor(config) {
        this.config = config;
        this.baseURL = `https://api.github.com/repos/${config.username}/${config.repository}/contents`;
    }

    async saveToGitHub(formData) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `user-data-${timestamp}.json`;
            
            const content = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email || '',
                address: formData.address || '',
                submittedAt: new Date().toISOString()
            };

            const contentBase64 = btoa(JSON.stringify(content, null, 2));
            
            const response = await fetch(`${this.baseURL}/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `添加用户数据: ${formData.name}`,
                    content: contentBase64
                })
            });

            if (!response.ok) {
                throw new Error(`GitHub API错误: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('保存到GitHub失败:', error);
            throw error;
        }
    }

    async getAllData() {
        try {
            const response = await fetch(this.baseURL, {
                headers: {
                    'Authorization': `token ${this.config.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`获取数据失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('获取GitHub数据失败:', error);
            throw error;
        }
    }
}

class FormManager {
    constructor() {
        this.validator = new FormValidator();
        this.githubService = new GitHubService(GITHUB_CONFIG);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('userForm');
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');

        // 实时验证
        nameInput.addEventListener('blur', () => this.validateField('name'));
        phoneInput.addEventListener('blur', () => this.validateField('phone'));
        emailInput.addEventListener('blur', () => this.validateField('email'));

        // 表单提交
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(fieldName) {
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        const value = input.value.trim();

        let result;
        switch (fieldName) {
            case 'name':
                result = this.validator.validateName(value);
                break;
            case 'phone':
                result = this.validator.validatePhone(value);
                break;
            case 'email':
                result = this.validator.validateEmail(value);
                break;
            default:
                return;
        }

        if (result.isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            errorElement.textContent = '';
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            errorElement.textContent = result.message;
        }

        return result.isValid;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const nameValid = this.validateField('name');
        const phoneValid = this.validateField('phone');
        const emailValid = this.validateField('email');

        if (!nameValid || !phoneValid || !emailValid) {
            this.showStatus('请正确填写所有必填字段', 'error');
            return;
        }

        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim()
        };

        await this.saveFormData(formData);
    }

    async saveFormData(formData) {
        this.showLoading(true);
        
        try {
            await this.githubService.saveToGitHub(formData);
            this.showStatus('数据提交成功！已保存到GitHub仓库', 'success');
            this.resetForm();
        } catch (error) {
            this.showStatus(`提交失败: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.classList.remove('hidden');

        // 3秒后自动隐藏成功消息
        if (type === 'success') {
            setTimeout(() => {
                statusElement.classList.add('hidden');
            }, 3000);
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    resetForm() {
        document.getElementById('userForm').reset();
        // 移除验证样式
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new FormManager();
    
    // 添加一些示例数据用于演示
    console.log('表单管理系统已初始化');
    console.log('请确保在GitHub配置中填写正确的用户名、仓库名和个人访问令牌');
});

// 备用保存方法 - 如果GitHub API不可用，使用localStorage
function saveToLocalStorage(formData) {
    try {
        const existingData = JSON.parse(localStorage.getItem('userForms') || '[]');
        existingData.push({
            ...formData,
            id: Date.now()
        });
        localStorage.setItem('userForms', JSON.stringify(existingData));
        return true;
    } catch (error) {
        console.error('保存到本地存储失败:', error);
        return false;
    }
}
