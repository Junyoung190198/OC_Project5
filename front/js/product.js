/**
 * Script for the product page product.html
 */


/**
 * Getting the id from the url using URLSearchParams 
 * constructor
 */
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');
const url = 'http://localhost:3000/api/products/';


/**
 * Variables to access the DOM
 */

const itemImgDiv = document.querySelector('.item__img');
const itemImg = document.createElement('img');
const itemTitle = document.getElementById('title');
const itemPrice = document.getElementById('price');
const itemDescription = document.getElementById('description');
const itemColors = document.getElementById('colors');
const addToCart = document.getElementById('addToCart');


/**
 * Function to send a GET request to the server to get on product
 * by it's id
 */


function makeGetRequest(url, id){
    return new Promise( (resolve, reject) =>{
        let request = new XMLHttpRequest();
        request.open('GET', url + id);
        console.log(url + id);
        request.onreadystatechange = ()=>{
            if(request.readyState === 4){
                if(request.status === 200){
                    resolve(JSON.parse(request.response));
                } else{
                    reject(JSON.parse(request.response));
                }
            }
        };
        request.send();
    });
}

/**
 * Function to fecth only one product based on a specific id,
 * update the DOM with the specific fetched product
 */


async function fetchOneProduct(){
    try{
        let response = await makeGetRequest(url, id);
        itemImg.setAttribute('src', response.imageUrl);
        itemImg.setAttribute('alt', response.altTxt);
        itemImgDiv.appendChild(itemImg);
    
        itemTitle.value = response.name;
        itemTitle.textContent = response.name;
        itemPrice.value = response.price;
        itemPrice.textContent = response.price;
        itemDescription.textContent = response.description;
    
        const colorArray  = response.colors;
    
        for(let i=0;i<colorArray.length;i++){
            let colorsOption = document.createElement('option');
            colorsOption.value = colorArray[i];
            colorsOption.textContent = colorArray[i];
            itemColors.appendChild(colorsOption);
        }

    } catch(e){
        console.log(e);
        itemTitle.textContent = 'An error occured!';
    }
   
}

fetchOneProduct();

/**
 * Add item to the localStorage instance,
 * add it by objects, so one key equal to one object with different
 * key: id, quantity etc...
 */

function addCartToLocalStorage(id, quantity, color){
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === id && item.color === color);

    if(existingItem){
        existingItem.quantity = parseInt(existingItem.quantity) + parseInt(quantity);
    } else{
        let newItem = {
            id: id,
            quantity: parseInt(quantity),
            color: color,
        };

        cart.push(newItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Get input values of the DOM
 */

let itemColor = '';
const itemQuantity = document.getElementById('quantity');
let quantity = '';

itemColors.addEventListener('change', ($event)=>{
    itemColor = $event.target.value;
});

itemQuantity.addEventListener('change', ($event)=>{
    quantity = parseInt($event.target.value);
});


/**
 * add item to the local storage when clicking the add cart button,
 * and display simple confirmation message
 */

const confirmationMessage = document.getElementById('item-added-confirmation');

addToCart.addEventListener('click', ()=>{
    confirmationMessage.textContent = '';
    if(!itemColor || !quantity){
        confirmationMessage.style.color = 'red';
        confirmationMessage.textContent = 'Please select both color and quantity';
    }else{
        addCartToLocalStorage(id, quantity, itemColor);
        confirmationMessage.innerHTML = itemTitle.value + ' added to the cart';
        confirmationMessage.style.color = 'white';
    }
});






