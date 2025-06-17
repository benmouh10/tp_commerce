document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        fetchProductDetails(productId);
    } else {
        window.location.href = 'index.html';
    }
    
    updateCartCount();
});

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const product = await response.json();
        displayProductDetails(product);
    } catch (error) {
        console.error("Erreur:", error);
        document.getElementById('product-details').innerHTML = `
            <div class="alert alert-danger">
                Produit non trouvé. <a href="index.html">Retour à l'accueil</a>
            </div>
        `;
    }
}

function displayProductDetails(product) {
    document.title = `${product.title} - E-Commerce Demo`;
    
    document.getElementById('product-details').innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div id="product-carousel" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${product.images.map((img, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <img src="${img}" class="d-block w-100 rounded" alt="${product.title}">
                            </div>
                        `).join('')}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#product-carousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#product-carousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            <div class="col-md-6">
                <h1>${product.title}</h1>
                <div class="d-flex align-items-center mb-3">
                    <div class="rating me-3">
                        ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}
                        <small class="text-muted">(${product.rating})</small>
                    </div>
                    <span class="badge bg-success">${product.stock} en stock</span>
                </div>
                <h3 class="text-primary mb-4">$${product.price}</h3>
                <p class="mb-4">${product.description}</p>
                <div class="mb-4">
                    <h5>Caractéristiques</h5>
                    <ul>
                        <li>Marque: ${product.brand || 'Non spécifiée'}</li>
                        <li>Catégorie: ${product.category}</li>
                        <li>Réduction: ${product.discountPercentage}%</li>
                    </ul>
                </div>
                <button onclick="addToCart(${product.id})" class="btn btn-primary btn-lg w-100 mb-3">
                    Ajouter au panier
                </button>
                <a href="index.html" class="btn btn-outline-secondary w-100">
                    Continuer vos achats
                </a>
            </div>
        </div>
    `;
}

window.addToCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // On récupère juste les infos essentielles pour le panier
        const productTitle = document.querySelector('h1').textContent;
        const productPrice = parseFloat(document.querySelector('.text-primary').textContent.replace('$', ''));
        const productThumbnail = document.querySelector('.carousel-item.active img').src;
        
        cart.push({
            id: productId,
            title: productTitle,
            price: productPrice,
            thumbnail: productThumbnail,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Produit ajouté au panier');
};

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}