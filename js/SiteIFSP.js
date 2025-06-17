document.addEventListener('DOMContentLoaded', function() {
    // Efeito suave para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Atualiza a URL sem recarregar a página
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Efeito de destaque para a seção ativa na navegação
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('nav ul li a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
    
    // Adiciona classe active ao primeiro item por padrão
    if (navItems.length > 0) {
        navItems[0].classList.add('active');
    }
    
    // Animação para os cards
    const animateOnScroll = function() {
        const cards = document.querySelectorAll('.team-card, .service-item');
        
        cards.forEach(card => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (cardPosition < screenPosition) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Define opacidade inicial e prepara para animação
    const cards = document.querySelectorAll('.team-card, .service-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Executa uma vez ao carregar para verificar itens visíveis
});

function toggleSubmenu() {
      var submenu = document.getElementById("submenu");
      submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}