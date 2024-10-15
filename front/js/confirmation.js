/**
 * Usefull DOM variables and urlParams to extract the order id
 * from the url
 */

const orderId = document.getElementById('orderId');
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('orderId');

/**
 * Display the extracted order id from the url to the user
 */
orderId.textContent = id;