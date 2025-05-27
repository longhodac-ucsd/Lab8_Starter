// main.js

// CONSTANTS
const RECIPE_URLS = [
    'https://adarsh249.github.io/Lab8-Starter/recipes/1_50-thanksgiving-side-dishes.json',
    'https://adarsh249.github.io/Lab8-Starter/recipes/2_roasting-turkey-breast-with-stuffing.json',
    'https://adarsh249.github.io/Lab8-Starter/recipes/3_moms-cornbread-stuffing.json',
    'https://adarsh249.github.io/Lab8-Starter/recipes/4_50-indulgent-thanksgiving-side-dishes-for-any-holiday-gathering.json',
    'https://adarsh249.github.io/Lab8-Starter/recipes/5_healthy-thanksgiving-recipe-crockpot-turkey-breast.json',
    'https://adarsh249.github.io/Lab8-Starter/recipes/6_one-pot-thanksgiving-dinner.json',
];

// Run the init() function when the page has loaded
window.addEventListener('DOMContentLoaded', init);

// Starts the program, all function calls trace back here
async function init() {
  // initialize ServiceWorker
  initializeServiceWorker();
  // Get the recipes from localStorage
  let recipes;
  try {
    recipes = await getRecipes();
  } catch (err) {
    console.error(err);
  }
  // Add each recipe to the <main> element
  addRecipesToDocument(recipes);
}

/**
 * Detects if there's a service worker, then loads it and begins the process
 * of installing it and getting it running
 */
function initializeServiceWorker() {
  // EXPLORE - START (All explore numbers start with B)
  /*******************/
  // ServiceWorkers have many uses, the most common of which is to manage
  // local caches, intercept network requests, and conditionally serve from
  // those local caches. This increases performance since users aren't
  // re-downloading the same resources every single page visit. This also allows
  // websites to have some (if not all) functionality offline! I highly
  // recommend reading up on ServiceWorkers on MDN before continuing.
  /*******************/
  // We first must register our ServiceWorker here before any of the code in
  // sw.js is executed.
  // B1. TODO - Check if 'serviceWorker' is supported in the current browser
  if ('serviceWorker' in navigator) {
    // B2. TODO - Listen for the 'load' event on the window object.
    window.addEventListener('load', () => {
  // Steps B3-B6 will be *inside* the event listener's function created in B2
  // B3. TODO - Register './sw.js' as a service worker (The MDN article
  //            "Using Service Workers" will help you here)
      navigator.serviceWorker
        .register('./sw.js')
  // B4. TODO - Once the service worker has been successfully registered, console
  //            log that it was successful.
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
  // B5. TODO - In the event that the service worker registration fails, console
  //            log that it has failed.
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
  else{
    console.warn("Service Workers are not supported by this browser.");
  }
  
  // STEPS B6 ONWARDS WILL BE IN /sw.js
}

/**
 * Reads 'recipes' from localStorage and returns an array of
 * all of the recipes found (parsed, not in string form). If
 * nothing is found in localStorage, network requests are made to all
 * of the URLs in RECIPE_URLs, an array is made from those recipes, that
 * array is saved to localStorage, and then the array is returned.
 * @returns {Array<Object>} An array of recipes found in localStorage
 */
async function getRecipes() {
  // EXPOSE - START (All expose numbers start with A)
  // A1. Check local storage – if recipes exist, return them immediately
  const stored = localStorage.getItem('recipes');
  if (stored) {
    return JSON.parse(stored);
  }

  // A2. Create an empty array to collect fetched recipes
  const recipes = [];

  // A3. Return a new Promise so callers can use .then/.catch if they prefer
  return new Promise((resolve, reject) => {
    // Use Promise.all to fetch all recipe URLs in parallel (A4–A9)
    const fetchPromises = RECIPE_URLS.map(url =>
      // A5. Wrap each fetch in a promise chain with its own error handling
      fetch(url)                                            // A6: fetch each URL :contentReference[oaicite:0]{index=0}
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);  // A10: propagate HTTP errors
          }
          return response.json();                           // A7: parse JSON body :contentReference[oaicite:1]{index=1}
        })
        .then(recipeData => {
          recipes.push(recipeData);                         // A8: add to array
        })
    );

    // A9. Once all fetches settle, save to storage and resolve; or catch any error
    Promise.all(fetchPromises)                             // :contentReference[oaicite:2]{index=2}
      .then(() => {
        // Save the gathered recipes so future calls hit localStorage
        saveRecipesToStorage(recipes);                      // user-provided helper
        resolve(recipes);                                   // return the array
      })
      .catch(error => {
        console.error('Error fetching recipes:', error);    // A10: log errors
        reject(error);                                      // A11: reject with error
      });
  });

  
}

/**
 * Takes in an array of recipes, converts it to a string, and then
 * saves that string to 'recipes' in localStorage
 * @param {Array<Object>} recipes An array of recipes
 */
function saveRecipesToStorage(recipes) {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

/**
 * Takes in an array of recipes and for each recipe creates a
 * new <recipe-card> element, adds the recipe data to that card
 * using element.data = {...}, and then appends that new recipe
 * to <main>
 * @param {Array<Object>} recipes An array of recipes
 */
function addRecipesToDocument(recipes) {
  if (!recipes) return;
  let main = document.querySelector('main');
  recipes.forEach((recipe) => {
    let recipeCard = document.createElement('recipe-card');
    recipeCard.data = recipe;
    main.append(recipeCard);
  });
}