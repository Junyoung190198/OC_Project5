console.log(localStorage.getItem('cart'));

/**
 * DOM variables and useful variables
 */

const url = 'http://localhost:3000/api/products/';
const postUrl = 'http://localhost:3000/api/products/order';

const cartSection = document.getElementById('cart__items');
const totalQuantityDisplay = document.getElementById('totalQuantity');
const totalPriceDisplay = document.getElementById('totalPrice');
const get = 'GET';
const post = 'POST';
let totalQuantity = 0;
let totalPrice = 0;
let ids = [];

/**
 * GET request function to get images of items in the cart,
 * images need to be given by the server and loaded onto the web browser
 */

function makeRequest(verb ,url, id, data){
    return new Promise( (resolve, reject) =>{
        let request = new XMLHttpRequest();
        if(id === null || id ===''){
            request.open(verb, url);
        } else{
            request.open(verb, url + id);
        }
        
        console.log('verb: ',verb);
        console.log('url: ',url);
        console.log('id: ', id);
        console.log('data:',data);
        request.onreadystatechange = ()=>{
            if(request.readyState === 4){
                if(request.status === 200 || request.status === 201){
                    resolve(JSON.parse(request.response));
                } else{
                    reject(JSON.parse(request.response));
                }
            }
        };
        if(verb === 'POST'){
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(data));
        }else{
            request.send();
        }
        
    });
}

/**
 * Simple function to display the updated total price and the total 
 * quantity of items
 */
function cartSummary(){
    totalQuantityDisplay.textContent = totalQuantity;
    totalPriceDisplay.textContent = totalPrice;
}

/**
 * async function to fetch needed information and display it,
 * calling 2 other functions, one to actually display one by one the products
 * in the cart, and one to make the GET request with a specific ID to retrieve
 * this specific product information (image, alt text etc...) 
 */
async function fecthAndDisplayCart(){
    let errorMessage = document.createElement('p');
    errorMessage.style.fontSize = '20px';
    

    try{
        let cart = JSON.parse(localStorage.getItem('cart'));
        if(!cart || cart.length === 0){
            errorMessage.textContent = 'The cart is empty!';

        } else{
            for(const item of cart){
                let id = item.id;
                console.log(id);
                let response = await makeRequest(get ,url, id);
                displayProducts(item, response);
            }

            cartSummary();
            removeOrUpdateItem();            
        }   

    } catch(e){
        errorMessage.textContent = 'Error: ' + e;
    }    
}   



/**
 * Take 2 arguments: item which is one item product object at a index in the cart 
 * array and the receive response of the API, take those informations and create
 * needed elements and append them to the DOM
 */
function displayProducts(item, response){
    let totalItemPrice = parseInt(response.price);
    if(parseInt(item.quantity) > 1){
        totalItemPrice = parseInt(response.price) * parseInt(item.quantity);
    }

    totalQuantity += parseInt(item.quantity);
    totalPrice += parseInt(totalItemPrice);

    console.log(totalPrice);
    console.log(totalQuantity);

    const article = document.createElement('article');
    article.classList.add('cart__item');
    article.setAttribute('data-id', item.id);
    article.setAttribute('data-color', item.color);

    // Is it feasable?
    // article.setAttribute('data-totalPrice', totalItemPrice);

    article.innerHTML = `<div class="cart__item__img">
                  <img src="${response.imageUrl}" alt="${response.altTxt}">
                </div>
                <div class="cart__item__content">
                  <div class="cart__item__content__description">
                    <h2>${response.name}</h2>
                    <p>${item.color}</p>
                    <p class="item-price">${response.price}$</p>
                    <p class="total-item-price">Total: ${totalItemPrice}</p>
                  </div>
                  <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                      <p>Quantity :</p>
                      <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                      <button class="delete-button">Delete</button>
                    </div>
                  </div>
                </div>
                `;
    
    cartSection.appendChild(article);
}

/**
 * Adding necessary EventListener to updates input and remove input,
 * reflects the update or the removal on total variables and localStorage
 */
function removeOrUpdateItem(){
    let deleteButtons = document.querySelectorAll('.delete-button');
    let quantityInput = document.querySelectorAll('.itemQuantity');

    let cart = JSON.parse(localStorage.getItem('cart'));

    deleteButtons.forEach(button =>{
        button.addEventListener('click', (event)=>{
            let article = event.target.closest('.cart__item');
            let itemId = article.dataset.id;
            let itemColor = article.dataset.color;

            let quantityDOM = article.querySelector('.itemQuantity'); 
            let quantityString = quantityDOM.value;
            let priceDOM = article.querySelector('.item-price');
            let priceString = priceDOM.textContent.replace(/[^\d.-]/g, '');

            cart = cart.filter(item=> !(item.id === itemId && item.color === itemColor));
            localStorage.setItem('cart', JSON.stringify(cart));

            let quantity = parseInt(quantityString);
            let price = parseInt(priceString);
            deleteItemCartSummary(quantity, price);
            article.remove();        
        });
    });

    // Other way to do things than metadata data-id?
    quantityInput.forEach(input =>{
        input.addEventListener('change', (event)=>{
            let article = event.target.closest('.cart__item');
            let itemId = article.dataset.id;
            let itemColor = article.dataset.color;            
            let newQuantity = event.target.value;

            let priceDOM = article.querySelector('.item-price');
            let price = priceDOM.textContent.replace(/[^\d.-]/g, '');

            let item = cart.find(item => itemId === item.id && itemColor === itemColor); 
            if(item){
                let previousQuantity = item.quantity;
                item.quantity = parseInt(newQuantity);
                localStorage.setItem('cart', JSON.stringify(cart));

                let previousQuantityInt = parseInt(previousQuantity);
                let newQuantityInt = parseInt(newQuantity);
                let priceInt = parseInt(price);
                updateCartSummary(previousQuantityInt, newQuantityInt, priceInt);
            }
        });
    });
}

/**
 * Function that updates the cart summary by removing the item that was removed
 * from the user
 */
function deleteItemCartSummary(quantity, price){
    console.log('price: ' + price);
    console.log('quantity: ' + quantity);
    const totalItemPrice = price * quantity;
    console.log(totalItemPrice);

    totalQuantity = totalQuantity - quantity;
    totalPrice =  totalPrice - totalItemPrice;
    if(totalPrice < 0){
        totalPrice =0;
    }
    console.log('total quantity: ' + totalQuantity);
    console.log('total price: ' + totalPrice);
    totalQuantityDisplay.textContent = totalQuantity;
    totalPriceDisplay.textContent = totalPrice.toFixed(2);
}

/**
 * Function that updates the cart summary and the total price and quantity
 * by annalyzing the difference after the input update of the user
 */
function updateCartSummary(previousQuantity, newQuantity, price){
    if(previousQuantity === newQuantity){
        return;
    }    

    console.log('price: ' + price);

    totalQuantity = totalQuantity + (newQuantity - previousQuantity);
    totalQuantityDisplay.textContent = totalQuantity;

    const previousItemTotalPrice = price * previousQuantity;
    const newItemTotalPrice = price * newQuantity;
    console.log('new item total price: ' + newItemTotalPrice);
    console.log('previous item total price: ' + previousItemTotalPrice);
    totalPrice = totalPrice + (newItemTotalPrice - previousItemTotalPrice);
    if(totalPrice < 0){
        totalPrice = 0;
    }
    totalPriceDisplay.textContent = totalPrice.toFixed(2);
    console.log('total quantity: ' + totalQuantity);
    console.log('total price: ' + totalPrice);
    console.log('new quantity: ' + newQuantity);
    console.log('previous quantity: ' + previousQuantity);
}

fecthAndDisplayCart();


/**
 *  DOM variables for listening to input and submit events,
 * and extract user's input
 */
const form = document.querySelector('.cart__order__form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const addressInput = document.getElementById('address');
const cityInput = document.getElementById('city');
const emailInput = document.getElementById('email');
const inputs = document.querySelectorAll('.cart__order__form input[type="text"], .cart__order__form input[type="email"]');

/**
 * input listeners and one submit listner to handle all inputs from the user,
 * display error messages when needed and check data validity before sending
 * to the server
 */
firstNameInput.addEventListener('input', (event)=>{
    const id = event.target.id;
    const inputValue = event.target.value;
    const errorMessage = document.getElementById(`${id}ErrorMsg`);
    const nameRegex = /^[A-Za-z\s]+$/;

    if(!firstNameInput.checkValidity()){
        errorMessage.textContent = `${id} is required`;
    }else if(!nameRegex.test(inputValue)){
        errorMessage.textContent = 'First name should be only letters!'
    } else{
        errorMessage.textContent = '';
    }
});

lastNameInput.addEventListener('input', (event)=>{
    const id = event.target.id;
    const inputValue = event.target.value;
    const errorMessage = document.getElementById(`${id}ErrorMsg`);
    const nameRegex = /^[A-Za-z\s]+$/;

    if(!lastNameInput.checkValidity()){
        errorMessage.textContent = `${id} is required`;
    }else if(!nameRegex.test(inputValue)){
        errorMessage.textContent = 'Last name should be only letters!'
    } else{
        errorMessage.textContent = '';
    }
});

addressInput.addEventListener('input', (event)=>{
    const id = event.target.id;
    const inputValue = event.target.value;
    const errorMessage = document.getElementById(`${id}ErrorMsg`);
    const addressRegex = /^\d+\s+[A-Za-z0-9\s,.#-]+$/;

    if(!addressInput.checkValidity()){
        errorMessage.textContent = `${id} is required`;
    }else if(!addressRegex.test(inputValue)){
        errorMessage.textContent = 'Address should be a valid one!'
    } else{
        errorMessage.textContent = '';
    }
});

cityInput.addEventListener('input', (event)=>{
    const id = event.target.id;
    const inputValue = event.target.value;
    const errorMessage = document.getElementById(`${id}ErrorMsg`);
    const cityRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

    if(!cityInput.checkValidity()){
        errorMessage.textContent = `${id} is required`;
    }else if(!cityRegex.test(inputValue)){
        errorMessage.textContent = 'City should be a valid one!';
    } else{
        errorMessage.textContent = '';
    }  
});

emailInput.addEventListener('input', (event) => {
    const id = event.target.id;
    const inputValue = event.target.value;
    const errorMessage = document.getElementById(`${id}ErrorMsg`);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;

    if(!emailRegex.test(inputValue)){
        errorMessage.textContent = 'Email should at least containt a @ symbole and a valid domain name!';
    } else{
        errorMessage.textContent = '';
    }          
});


/**
 * Listener to listen when a user loses focus of input fields without entering
 * any inputs. If so, display an error message, usage: input listener cannot know
 * if the user just selected the field but didn't enter any inputs, so combining
 * input type listener with blur type listener to force user to enter something.
 */
inputs.forEach(input =>{
    input.addEventListener('blur', (event)=>{
        const text = event.target.value;
        const id = event.target.id;
        const errorMessage = document.getElementById(`${id}ErrorMsg`);
        if(text.trim().length <= 0){
            errorMessage.textContent = `${id} cannot be empty!`;
        } else{
            errorMessage.textContent = '';
        }
    });
});

/**
 * submit listener to listen to any submitting event within the form,
 * call async function to make a POST request, the data sent is the data 
 * collected from the user's inputs + an array of product's ids strings
 */
form.addEventListener('submit', (event)=>{  
    event.preventDefault();
    const firstName = firstNameInput.value; 
    const lastName = lastNameInput.value;
    const address = addressInput.value; 
    const city = cityInput.value; 
    const email = emailInput.value; 

    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.forEach(item =>{
        ids.push(item.id);
    });

    const contact = {
        firstName: firstName,
        lastName: lastName,
        address: address,
        city: city,
        email: email
    };

    const order = {
        contact: contact,
        products: ids
    };

    sendContactConfirmation(order);
});


async function sendContactConfirmation(order){
    try{
        let response = await makeRequest(post, postUrl, null, order);
        const id = response.orderId;
        window.location.href = `confirmation.html?orderId=${id}`;
    
    } catch(e){
        console.log(e);
        const div = document.querySelector('.cart__order');
        div.style.display = 'block';
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error: ' + e.error;
        div.appendChild(errorMessage);
    }
}
