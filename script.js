document.getElementById('infoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('.submit-btn');
    const originalHTML = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>提交中...';
    submitBtn.disabled = true;
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    setTimeout(() => {
        generateTxtFile(name, phone);
        showSuccessMessage();
        resetForm();
        
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }, 1000);
});

function generateTxtFile(name, phone) {
    const timestamp = new Date().toLocaleString('zh-CN');
    const content = `用户信息记录\n\n姓名: ${name}\n电话: ${phone}\n提交时间: ${timestamp}\n\n--- 信息收集表单 ---`;
    
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `用户信息_${name}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('hidden');
    
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

function resetForm() {
    document.getElementById('infoForm').reset();
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.style.transform = 'scale(1.02)';
    this.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.2);
    });
    
    input.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'none';
    });
});
