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
