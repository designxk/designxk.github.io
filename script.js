<code_start project_name=表单提交网站 filename=script.js title=表单处理逻辑 entrypoint=false runnable=false project_final_file=true>
// GitHub Issues API 配置
const GITHUB_TOKEN = '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';
const REPO_OWNER = 'designxk';
const REPO_NAME = 'designxk';

// 生成并下载txt文件
function generateTxtFile(name, phone) {
    const content = `姓名: ${name}\n电话: ${phone}\n提交时间: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `用户信息_${name}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 提交到GitHub Issues
async function submitToGitHub(name, phone) {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: `用户信息提交 - ${name}`,
                body: `**用户信息详情**\n\n- 姓名: ${name}\n- 电话: ${phone}\n- 提交时间: ${new Date().toLocaleString()}`,
                labels: ['user-info']
            })
        });

        return response.ok;
    } catch (error) {
        console.error('提交到GitHub失败:', error);
        return false;
    }
}

// 表单提交处理
document.getElementById('infoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>提交中...';
    submitButton.disabled = true;
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    try {
        const githubSuccess = await submitToGitHub(name, phone);
        
        if (!githubSuccess) {
            generateTxtFile(name, phone);
        }
        
        showSuccessMessage();
        resetForm();
    } catch (error) {
        generateTxtFile(name, phone);
        showSuccessMessage();
        resetForm();
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('hidden');
    successMessage.classList.add('success-animation');
    
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

function resetForm() {
    document.getElementById('infoForm').reset();
}

// 输入框动画效果
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('scale-105');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('scale-105');
    });
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('表单页面已加载完成');
    
    if (GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
        console.warn('请配置GitHub Token、用户名和仓库名');
    }
});
<code_end>
