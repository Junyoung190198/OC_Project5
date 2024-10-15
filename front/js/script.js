/**
 * Script for the homepage index.html
 */


/**
 * DOM elements to dynamically update
 */
const itemSection = document.getElementById('items');



const url = 'http://localhost:3000/api/products';


/**
 * Make a get request function
 * 
 */
function makeGetRequest(url){
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('GET', url);
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
 * async function to fect all products at once
 * call the makeGetRequest function and wait for the Promise to resolve
 * then update the DOM dynamically with the received response
 */
async function fecthAllProducts(){
    try{
        const response = await makeGetRequest(url);
        
        for(let i=0;i<response.length;i++){
            let itemLink = document.createElement('a');
            let itemArticle = document.createElement('article');
            let itemImage = document.createElement('img');
            let itemTitle = document.createElement('h3');
            let itemDescription = document.createElement('p');
            let itemPrice = document.createElement('p');
            let itemColor = document.createElement('p');
    
            itemLink.setAttribute('href', './product.html?id=' + response[i]._id);
            itemImage.setAttribute('src', response[i].imageUrl);    
            itemImage.setAttribute('alt', response[i].altTxt);
            itemPrice.classList.add('itemPrice');
            

            itemTitle.textContent = response[i].name;
            itemDescription.textContent = response[i].description;
            itemColor.textContent = 'Available in: ' + response[i].colors;
            itemPrice.textContent = response[i].price + '$';

            itemArticle.appendChild(itemImage);
            itemArticle.appendChild(itemTitle);
            itemArticle.appendChild(itemColor);
            itemArticle.appendChild(itemDescription);
            itemArticle.appendChild(itemPrice);

            itemLink.appendChild(itemArticle);

            itemSection.appendChild(itemLink);
        } 

    }catch(e){
        let errorText = document.createElement('h3');
        errorText.textContent = e.error;
        itemSection.appendChild(errorText);
    } 
}

fecthAllProducts();