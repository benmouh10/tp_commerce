document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    updateCartSummary();
    setupEventListeners();
});

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-4">
                <h4>Votre panier est vide</h4>
                <a href="index.html" class="btn btn-primary mt-2">Continuer vos achats</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item row mb-3 align-items-center" data-id="${item.id}">
            <div class="col-3 col-md-2">
                <img src="${item.thumbnail}" alt="${item.title}" class="img-fluid rounded">
            </div>
            <div class="col-5 col-md-6">
                <h5 class="mb-1">${item.title}</h5>
                <p class="mb-1 text-success fw-bold">$${item.price.toFixed(2)}</p>
            </div>
            <div class="col-4 col-md-4">
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary decrease-quantity">-</button>
                    <span class="mx-2 quantity">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary increase-quantity">+</button>
                    <button class="btn btn-sm btn-danger ms-2 remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateCartCount();
}

function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 9.99) : 0;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function setupEventListeners() {
    // Augmenter/diminuer quantité
    document.getElementById('cart-items').addEventListener('click', function(e) {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;
        
        const itemId = parseInt(cartItem.dataset.id);
        const cart = JSON.parse(localStorage.getItem('cart'));
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (e.target.classList.contains('increase-quantity')) {
            cart[itemIndex].quantity += 1;
        } else if (e.target.classList.contains('decrease-quantity')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
        } else if (e.target.classList.contains('remove-item')) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
    });
    
    // Vider le panier
    document.getElementById('clear-cart').addEventListener('click', function() {
        localStorage.removeItem('cart');
        displayCartItems();
        updateCartSummary();
    });
    
    // Passer commande
    document.getElementById('checkout-btn').addEventListener('click', function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Votre panier est vide');
            return;
        }
        
        alert('Commande passée avec succès!');
        localStorage.removeItem('cart');
        displayCartItems();
        updateCartSummary();
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}