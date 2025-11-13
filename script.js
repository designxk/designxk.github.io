document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有激活状态
            document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        });
            
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // 添加当前激活状态
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // 表单提交处理
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 表单验证
            const formData = new FormData(this);
            let isValid = true;
            
            // 检查必填字段
            const requiredFields = this.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // 模拟表单提交成功
                alert('需求提交成功！我们将尽快联系您。');
                this.reset();
            } else {
                alert('请填写所有必填字段');
            }
        });
    }

    // 滚动动画效果
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // 文件上传样式处理
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', function() {
            const fileName = this.files[0]?.name || '未选择文件';
        const label = this.nextElementSibling;
        label.textContent = fileName;
        label.classList.add('file-selected');
        });
    }
});