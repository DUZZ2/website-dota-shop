// ====================================
// ГЛОБАЛЬНІ ЗМІННІ ТА КОНФІГУРАЦІЯ
// ====================================
let cart = []; 
const productsData = []; 

// Елементи DOM
// ... (не змінюються)
const cartIconLink = document.getElementById('cart-icon-link'); 
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.querySelector('.modal .close-btn');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const searchInput = document.querySelector('.search-input');
const navItems = document.querySelectorAll('.nav-item'); 
// Оновлено: вибір усіх секцій товарів (тепер #accessories та #figures замінені на #acc_fig)
const productSections = document.querySelectorAll('.products-section'); 


// ====================================
// 1. ІНІЦІАЛІЗАЦІЯ ДАНИХ ТОВАРІВ (ДЛЯ ПОШУКУ)
// ====================================

function initializeProductsData() {
    // Збираємо дані про товари з усіх секцій. Логіка залишається та сама.
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name').textContent.trim();
        // Враховуємо "sale" ціни
        const priceText = card.querySelector('.product-price').textContent.replace('$', '').trim().split(' ')[0]; 
        const price = parseFloat(priceText);
        
        productsData.push({ name, price, cardElement: card });
    });
}

// ====================================
// 2. ЛОГІКА КОШИКА (CART LOGIC)
// ... (без змін)
// ====================================

function updateCartIcon() {
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartIconLink.textContent = cartItemCount > 0 ? `🛒 (${cartItemCount})` : '🛒';
}

function renderCart() {
    cartItemsList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart-message">Кошик порожній. Час почати полювання за мерчем! 🏹</p>';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemHTML = `
                <div class="cart-item">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">Кількість: ${item.quantity}</span>
                    <span class="item-price">${itemTotal.toFixed(2)} $</span>
                    <button class="btn-remove-item" data-index="${index}">Видалити</button>
                </div>
            `;
            cartItemsList.innerHTML += cartItemHTML;
        });
    }

    cartTotalElement.textContent = total.toFixed(2) + ' $';
    updateCartIcon();
}

// Обробник кліку для додавання товару
document.querySelectorAll('.btn-add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        const productCard = event.target.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent.trim();
        const priceText = productCard.querySelector('.product-price').textContent.replace('$', '').trim().split(' ')[0];
        const price = parseFloat(priceText);

        const existingItem = cart.find(item => item.name === productName);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name: productName, price: price, quantity: 1 });
        }
        
        console.log(`${productName} додано до кошика.`);
        updateCartIcon();
    });
});

// Обробники для модального вікна
cartIconLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderCart(); 
    cartModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length > 0) {
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
        alert(`🎉 Замовлення на суму ${totalAmount} $ успішно оформлено! Дякуємо! 📦`);
        cart = []; 
        cartModal.style.display = 'none';
        renderCart();
    } else {
        alert('Кошик порожній! Додайте товари для оформлення замовлення.');
    }
});

cartItemsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove-item')) {
        const indexToRemove = parseInt(e.target.dataset.index);
        cart.splice(indexToRemove, 1);
        renderCart();
        console.log('Товар видалено з кошика.');
    }
});

window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});


// ====================================
// 3. ЛОГІКА ПОШУКУ (SEARCH LOGIC)
// ... (без змін)
// ====================================

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Перебираємо всі дані про товари і вирішуємо, чи показувати картку
    productsData.forEach(product => {
        const productNameLower = product.name.toLowerCase();
        
        // Знаходимо батьківський product-grid для відображення повідомлення
        const productGridElement = product.cardElement.closest('.product-grid');

        if (productNameLower.includes(searchTerm)) {
            product.cardElement.style.display = 'flex'; 
        } else {
            product.cardElement.style.display = 'none';
        }
    });

    // Логіка відображення повідомлення "Нічого не знайдено"
    const allCards = document.querySelectorAll('.product-card');
    const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none' && card.closest('.product-grid'));

    let noResults = document.getElementById('no-results-message');

    if (visibleCards.length === 0 && searchTerm.length > 0) {
        if (!noResults) {
            noResults = document.createElement('p');
            noResults.id = 'no-results-message';
            noResults.textContent = `За запитом "${searchTerm}" нічого не знайдено. 😥`;
            // Додаємо його до першого product-grid або в кінець секції
            document.querySelector('.products-section').appendChild(noResults); 
        } else {
             noResults.textContent = `За запитом "${searchTerm}" нічого не знайдено. 😥`;
        }
    } else {
        if (noResults) {
            noResults.remove();
        }
    }
});


// ====================================
// 4. ЛОГІКА НАВІГАЦІЇ (SCROLL & ACTIVE STATE)
// ====================================

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const targetId = e.target.getAttribute('href'); 
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // Плавна прокрутка до розділу
            window.scrollTo({
                top: targetSection.offsetTop - 70, 
                behavior: 'smooth'
            });
        }
        
        // Встановлення активного класу одразу після кліку
        navItems.forEach(i => i.classList.remove('active'));
        e.target.classList.add('active');

        // Скидання стану пошуку при зміні розділу
        searchInput.value = '';
        productsData.forEach(p => p.cardElement.style.display = 'flex'); 
        const noResults = document.getElementById('no-results-message');
        if (noResults) {
            noResults.remove();
        }
    });
});

// Додаткова логіка: Встановлення активного стану навігації при прокручуванні сторінки
// Примітка: productSections містить коректні елементи DOM (вже оновлено при ініціалізації)
window.addEventListener('scroll', () => {
    let current = '';

    productSections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - window.innerHeight * 0.3) { 
            current = '#' + section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === current) {
            item.classList.add('active');
        }
    });
});


// ====================================
// 5. ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ
// ====================================
window.onload = () => {
    initializeProductsData();
    updateCartIcon();
};