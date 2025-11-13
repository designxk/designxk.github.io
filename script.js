// 移动端菜单切换
document.getElementById('mobile-menu-btn').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// 平滑滚动
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.classList.add('shadow-xl');
    } else {
        nav.classList.remove('shadow-xl');
    }
});

// 页面加载动画
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.section-hidden');
    animatedElements.forEach(el => {
        el.classList.add('section-visible');
    });
}

// 标签页切换功能
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有激活状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // 添加当前激活状态
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// 表单提交处理
document.getElementById('quote-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // 表单验证和提交逻辑
    alert('需求提交成功！我们将尽快联系您。');
});
