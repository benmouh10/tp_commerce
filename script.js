// Configuration
const productsPerPage = 12;
let currentPage = 1;
let allProducts = [];
let filteredProducts = [];

// Éléments DOM
const productsContainer = document.getElementById('products-container');
const pagination = document.getElementById('pagination');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const categoryFilters = document.getElementById('category-filters');
const sortSelect = document.getElementById('sort-select');
const resetFiltersBtn = document.getElementById('reset-filters');
const categoriesDropdown = document.getElementById('categories-dropdown');
const cartCount = document.getElementById('cart-count');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    fetchAllProducts();
    setupEventListeners();
});

// Récupérer tous les produits
async function fetchAllProducts() {
    try {
        let products = [];
        let total = 0;
        let skip = 0;
        const limit = 100; // On récupère tout d'un coup pour les filtres
        
        do {
            const response = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
            const data = await response.json();
            products = products.concat(data.products);
            total = data.total;
            skip += limit;
        } while (skip < total);
        
        allProducts = products;
        filteredProducts = [...allProducts];
        displayProducts(getProductsForCurrentPage());
        setupPagination();
        setupCategoryFilters();
    } catch (error) {
        console.error("Erreur:", error);
    }
}

// Afficher les produits
function displayProducts(products) {
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="col-12 text-center py-5"><h4>Aucun produit trouvé</h4></div>';
        return;
    }
    
    products.forEach(product => {
        const productCard = `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${product.thumbnail}" class="card-img-top product-image" alt="${product.title}">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${product.category}</span>
                            <span class="text-success fw-bold">$${product.price}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <small class="text-muted">Stock: ${product.stock}</small>
                            <div class="rating">
                                ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}
                                <small>(${product.rating})</small>
                            </div>
                        </div>
                        <button onclick="addToCart(${product.id})" class="btn btn-primary w-100">
                            Ajouter au panier
                        </button>
                        <a href="product.html?id=${product.id}" class="btn btn-outline-secondary w-100 mt-2">
                            Voir détails
                        </a>
                    </div>
                </div>
            </div>
        `;
        productsContainer.innerHTML += productCard;
    });
}

// Pagination
function setupPagination() {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) return;
    
    // Bouton Précédent
    pagination.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">&laquo;</a>
        </li>
    `;
    
    // Pages
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage($i)">${i}</a>
            </li>
        `;
    }
    
    // Bouton Suivant
    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">&raquo;</a>
        </li>
    `;
}

// Changer de page
window.changePage = function(page) {
    if (page < 1 || page > Math.ceil(filteredProducts.length / productsPerPage)) return;
    currentPage = page;
    displayProducts(getProductsForCurrentPage());
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Obtenir les produits pour la page actuelle
function getProductsForCurrentPage() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
}

// Filtres par catégorie
function setupCategoryFilters() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    // Filtres dans la sidebar
    categoryFilters.innerHTML = categories.map(category => `
        <div class="form-check">
            <input class="form-check-input category-checkbox" type="checkbox" value="${category}" id="cat-${category.replace(/\s+/g, '-')}">
            <label class="form-check-label" for="cat-${category.replace(/\s+/g, '-')}">
                ${category}
            </label>
        </div>
    `).join('');
    
    // Dropdown de navigation
    categoriesDropdown.innerHTML = categories.map(category => `
        <li><a class="dropdown-item" href="#" onclick="filterByCategory('${category}')">${category}</a></li>
    `).join('');
}

// Filtrer par catégorie
window.filterByCategory = function(category) {
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.checked = (checkbox.value === category);
    });
    applyFilters();
};

// Appliquer les filtres
function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(c => c.value);
    const maxPrice = parseInt(priceRange.value);
    const sortOption = sortSelect.value;
    
    filteredProducts = allProducts.filter(product => {
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const priceMatch = product.price <= maxPrice;
        return categoryMatch && priceMatch;
    });
    
    // Tri
    switch (sortOption) {
        case 'asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    currentPage = 1;
    displayProducts(getProductsForCurrentPage());
    setupPagination();
}

// Réinitialiser les filtres
function resetFilters() {
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    priceRange.value = 1000;
    priceValue.textContent = '1000';
    sortSelect.value = 'asc';
    applyFilters();
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    priceRange.addEventListener('input', function() {
        priceValue.textContent = this.value;
        applyFilters();
    });
    
    categoryFilters.addEventListener('change', function(e) {
        if (e.target.classList.contains('category-checkbox')) {
            applyFilters();
        }
    });
    
    sortSelect.addEventListener('change', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
}

// Panier
window.addToCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.title} ajouté au panier`);
};

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showToast(message) {
    // Créer un toast Bootstrap (assurez-vous d'avoir le CSS/JS de Bootstrap)
    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">Notification</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(toastContainer);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        toastContainer.remove();
    }, 3000);
}