//preloader
let preloader = document.querySelector(".wrapper-preloader");

window.addEventListener("load", () => {
    setTimeout(() => {
        preloader.remove();
    }, 500);
});

// Getting data from the server
const getAllProducts = async () => {
    try {
        const res = await fetch("https://dummyjson.com/products");
        const data = await res.json();
        return data.products;
    } catch (e) {
        console.error(e);
    }
};

const getProducts = async (endpoint) => {
    let sortProducts = await getAllProducts();
    sortProducts.sort((a, b) => b.rating - a.rating);
    let filterProducts = sortProducts.filter((el) => el.category === "smartphones" || el.category === "laptops");
    if (endpoint === "topAll") {
        return filterProducts.splice(0, 9);
    } else if (endpoint === "all") {
        return filterProducts;
    } else {
        return sortProducts.filter((el) => el.category === endpoint);
    }
};

// Create a product card

const createCardProduct = async (endpoint, id, numberOfCards) => {
    let products = await getProducts(endpoint);

    if (id && numberOfCards) {
        products = products.filter((el) => el.id !== id).splice(0, numberOfCards);
    }
    products.forEach((item) => {
        const $productCard = document.querySelector(".card-js");
        $productCard.insertAdjacentHTML("beforeend", `
        <div  class="product-card col mb-5">
            <div  class="card h-100" data-id="${item.id}">
                <div onclick = "goToProductCard(${item.id});" class="badge bg-dark text-white position-absolute" style="top: 0.5rem; right: 0.5rem">
                    Sale
                </div>
                <img onclick = "goToProductCard(${item.id});" height="170" class="card-img-top cursor-pointer" src="${item.thumbnail}"alt="..." />
                <div onclick = "goToProductCard(${item.id});" class="card-body p-4">
                    <div class="text-center">
                        <h5 class="fw-bolder cursor-pointer">${item.title}</h5>
                        <div class="d-flex justify-content-center rating">
                            <div class="d-flex small text-warning mb-2">
                                ${getRatingStars(item.rating)}
                            </div>
                            <div class="mx-3 rating__value">${item.rating}</div>
                        </div>
                        <span class="text-muted text-decoration-line-through mx-1">$${item.price}</span>
                        $${(item.price - item.price * (item.discountPercentage / 100)).toFixed(1)}
                    </div>
                </div>
                <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                    <div class="text-center"><a onclick = addToCart(${item.id}) class="btn btn-outline-dark mt-auto" data-cart href="#">Add to cart</a></div>
                </div>
            </div>
        </div>
        `);
    });
};

if (location.pathname === "/index.html" || location.pathname === "/")createCardProduct("topAll");
if (location.pathname === "/all_products.html") createCardProduct("all");
if (location.pathname === "/laptops.html") createCardProduct("laptops");
if (location.pathname === "/smartphones.html") createCardProduct("smartphones");

//Star rating

const getRatingStars = (rating) => {
    let stars = "";

    for (let i = 1; i <= Math.trunc(rating); i++) {
        stars += '<div class="bi-star-fill"></div>';
    }
    if (rating - Math.trunc(rating) >= 0.45 && rating - Math.trunc(rating) < 0.75) {
        stars += '<div class="bi-star-half"></div>';
    } else {
        for (let i = 1; i <= 5 - Math.trunc(rating); i++) {
            stars += '<div class="bi-star"></div>';
        }
    }
    return stars;
};

// Switch to a product by clicking on the card

function goToProductCard(id) {
    localStorage.setItem("productId", id);
    location.href = "/product.html";
}

// Detailed product card

const aboutProductCard = async (id) => {
    let aboutProducts = await getProducts("all");
    let item = aboutProducts.find((el) => el.id == id);
    createCardProduct(item.category, item.id, 3);

    const $aboutProductCard = document.querySelector(".card-product-js");
    const createAboutProductCard = $aboutProductCard.insertAdjacentHTML("beforeend", `
    <div class="product-card row gx-4 gx-lg-5 align-items-center" data-id="${item.id}">
        <div class="col-md-6"><img class="card-img-top mb-5 mb-md-0"
            src="${item.thumbnail}" alt="image${item.title}" />
        </div>
        <div class="col-md-6">
            <div class="small mb-1">SKU: BST-${item.id}</div>
            <h1 class="display-5 fw-bolder">${item.title}</h1>
            <div class="fs-5 mb-5">
                <span class="text-decoration-line-through">$${item.price}</span>
                <span>$${(item.price - item.price * (item.discountPercentage / 100)).toFixed(1)}</span>
            </div>
            <p class="lead">${item.description}</p>
            <div class="d-flex">
                <input class="form-control text-center me-3" id="inputQuantity" type="num" value="1"
                    style="max-width: 3rem" />
                <button onclick = addToCart(${item.id}) class="btn btn-outline-dark flex-shrink-0" data-cart type="button">
                    <i class="bi-cart-fill me-1"></i>
                    Add to cart
                </button>
            </div>
        </div>
    </div>`
    );
    return createAboutProductCard;
};

const productId = localStorage.getItem("productId");
if (location.pathname === "/product.html") aboutProductCard(productId);

//Cart

const addToCart = async (id) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let chooseProduct = await getProducts("all");
    let item = chooseProduct.find((el) => el.id == id);
    item.counter = 1;
    const productInCart = cart.find((el) => el.id == id);

    if (productInCart) {
        const $inputQuantity = document.querySelector("#inputQuantity");

        if ($inputQuantity) {
            productInCart.counter = +$inputQuantity.value + productInCart.counter;
        } else {
            productInCart.counter++;
        }
    } else {
        cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    getCartNumber();
};

// Number of items in the cart

getCartNumber = () => {
    const cart = JSON.parse(localStorage.getItem("cart"));
    const cartNumber = document.querySelector(".number-product");

    const counter = cart.reduce(function (count, item) {
        return count + item.counter;
    }, 0);

    cartNumber.innerHTML = counter;
};

getCartNumber();

// Status cart is empty

toggleCartStatus = () => {
    const $empryCart = document.querySelector(".js-empty-cart");

    if (JSON.parse(localStorage.getItem("cart")).length > 0) {
        $empryCart.classList.add("d-none");
    }
};

toggleCartStatus();

//Create cart product

const createCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart"));

    cart.forEach((item) => {
        const $cartWrapper = document.querySelector(".cart-js");
        const discountPrice = (item.price - item.price * (item.discountPercentage / 100)).toFixed(1);
        const createCart = $cartWrapper.insertAdjacentHTML("beforeend",`
            <div class="cart-item mb-4" data-id="${item.id}">
                <div class="d-flex align-items-start  mb-1">
                    <div onclick = "goToProductCard(${item.id});" class="col-4 cursor-pointer">
                        <img width="200" height ="125" src="${item.thumbnail}" alt="${item.title}">
                    </div>
                    <div onclick = "goToProductCard(${item.id});" class="fs-4 col-4 cursor-pointer">
                        <div>${item.title}</div>
                    </div>
                    <div class="col-2 d-flex align-items-center counter">
                        <div onclick ="clickMinus(${item.id});" class="btn fs-4" >-</div>
                        <div class="border border-dark align-middle px-3 rounded">${item.counter}</div>
                        <div onclick ="clickPlus(${item.id});" class="btn fs-4" >+</div>
                    </div>
                    <div class="col-2 d-flex justify-content-end">
                        <div class="price">
                            <span class="text-muted text-decoration-line-through mx-1 fs-6">$${item.price * item.counter}</span>
                            <span class="text-danger d-flex flex-nowrap fs-5">$${(discountPrice * item.counter).toFixed(1)}</span>  
                        </div>
                    </div>
                </div>
            </div>
        `);
        return createCart;
    });
};

// Click function on plus/minus

function clickPlus(id) {
    const cart = JSON.parse(localStorage.getItem("cart"));
    cart.map((item) => {
        if (item.id == id) {
            const counter = item.counter++;
            return counter;
        } else {
            return item;
        }
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload()
}

function clickMinus(id) {
    const cart = JSON.parse(localStorage.getItem("cart"));
    let filterCart = cart.filter((item) => {
        if(item.id == id){
            if(item.counter > 1){
                item.counter--
                return item;
            } else if(item.counter !== 1){
                return item;
            }
        }else {
            return item;
        }
    })
    localStorage.setItem("cart", JSON.stringify(filterCart));
    location.reload();
}

// Counter total price

function totalPrice() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    const $calculation = document.querySelector("#calculation");
    let calculation = [];

    cart.forEach((item) => {
        const quantityItemInCart = item.counter;
        const priceItemInCart = item.price;
        const discountPriceItemInCert = item.discountPercentage;

        const finalyPriceItemInCart = quantityItemInCart * (priceItemInCart - (priceItemInCart * discountPriceItemInCert) / 100).toFixed(1);

        calculation.push(finalyPriceItemInCart);
    });
    let total = calculation.reduce(function (sum, elem) {
        return sum + elem;
    }, 0);

    $calculation.innerHTML = total.toFixed(1);
}
totalPrice();

if (location.pathname === "/cart.html") createCart();
