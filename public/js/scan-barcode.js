"use strict";

/**
 * @file scan-barcode.js
 * @description Handles barcode scanning functionality using the html5-qrcode library with its pre-built UI.
 */

/**
 * DOM element to display scan results.
 * @type {HTMLElement | null}
 */
const scanResultElement = document.getElementById("scan-result");

/**
 * DOM element for manual barcode input.
 * @type {HTMLInputElement | null}
 */
const barcodeInputElement = document.getElementById("barcode-input");

/**
 * DOM element to display product details.
 * @type {HTMLElement | null}
 */
let productDetailsContainer = document.getElementById("product-details-container");

// Create product details container if it doesn't exist
if (!productDetailsContainer) {
    console.log("Creating product details container as it doesn't exist");
    productDetailsContainer = document.createElement("div");
    productDetailsContainer.id = "product-details-container";
    productDetailsContainer.className = "product-details-container";
    
    // Append to body or a specific container
    const scannerContainer = document.getElementById("scanner-container") || document.body;
    scannerContainer.appendChild(productDetailsContainer);
}

/**
 * Represents the HTML5 QR Code scanner instance with UI.
 * @type {Html5QrcodeScanner | null}
 */
let html5QrcodeScanner = null;

/**
 * Handles successful barcode scans.
 * @param {string} decodedText - The decoded text from the barcode.
 * @param {object} decodedResult - The detailed result object from the scanner.
 */
function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan result: ${decodedText}`, decodedResult);
    if (scanResultElement) {
        scanResultElement.textContent = `Scanned Barcode: ${decodedText}`;
    }
    
    // Immediately fetch product details using the scanned barcode
    console.log("Initiating product fetch from scan success handler");
    setTimeout(() => {
        fetchProductDetails(decodedText);
    }, 100); // Small delay to ensure UI updates first
    
    // Important: Clear the scanner after a successful scan to stop video and remove UI.
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().then(() => {
            console.log("Scanner cleared after success.");
        }).catch(error => {
            // console.error("Failed to clear scanner after success:", error);
        });
    }
}

/**
 * Handles scan failures (optional, as UI provides some feedback).
 * @param {string} error - The error message from the scanner.
 */
function onScanFailure(error) {
    // html5QrcodeScanner UI usually shows transient errors.
    // This callback is more for persistent errors or custom logging.
    // console.warn(`Scan error reported: ${error}`);
    // You might want to update scanResultElement for certain types of errors
    
    // if (scanResultElement) {
    //     scanResultElement.textContent = `Scan Error: ${error}`;
    // }
}

/**
 * Starts the camera barcode scanner with the pre-built UI.
 */
function startScanner() {
    if (!html5QrcodeScanner) {
        // Configuration for the Html5QrcodeScanner
        const config = {
            fps: 10,
            qrbox: { width: 350, height: 200 }, // Adjusted for a wider scanner display
            rememberLastUsedCamera: true,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.CODE_128
            ],
            // By default, both camera and file scan types are supported.
            // supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] // To only support camera
        };

        html5QrcodeScanner = new Html5QrcodeScanner(
            "scanner", // ID of the HTML element to render the scanner in
            config,
            /* verbose= */ false // Set to true for more verbose logs from the library
        );
    }

    // Check if scanner is already rendering or in a scanned state
    // Html5QrcodeScanner doesn't have a simple `isScanning` like Html5Qrcode.
    // We rely on the UI buttons it provides or clearing it to stop.
    // To prevent issues if called multiple times, ensure it's cleared if already setup.
    // However, typical usage is to call render once.
    
    // Clear any previous message
    if (scanResultElement) {
        scanResultElement.textContent = "Initializing scanner...";
    }

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    console.log("Html5QrcodeScanner rendering started.");
    if (scanResultElement) {
        // The UI itself will show messages like "Requesting camera permission..."
        scanResultElement.textContent = "Scanner UI active. Follow instructions in the scanner box.";
    }
}

/**
 * Stops the camera barcode scanner and clears its UI.
 */
function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().then(() => {
            console.log("Scanner stopped and UI cleared successfully.");
            if (scanResultElement) {
                scanResultElement.textContent = "Scanner stopped.";
            }
        }).catch(error => {
            console.error("Error stopping/clearing the scanner:", error);
            if (scanResultElement) {
                scanResultElement.textContent = "Error stopping scanner.";
            }
        });
    } else {
        console.log("Scanner not initialized or already cleared.");
        if (scanResultElement) {
            scanResultElement.textContent = "Scanner is not active.";
        }
    }
}

/**
 * Handles manual barcode submission.
 */
function handleManual() {
    if (barcodeInputElement && scanResultElement) {
        const barcodeValue = barcodeInputElement.value;
        if (barcodeValue) {
            scanResultElement.textContent = `Manually Entered Barcode: ${barcodeValue}`;
            console.log(`Manual entry: ${barcodeValue}`);
            
            // Fetch product details using the manually entered barcode
            fetchProductDetails(barcodeValue);
            
            barcodeInputElement.value = ""; // Clear the input field
        } else {
            scanResultElement.textContent = "Please enter a barcode value.";
        }
    }
}

/**
 * Fetches product details based on the barcode.
 * @param {string} barcode - The barcode to use for fetching product details.
 * @returns {Promise<void>} - A promise that resolves when the fetch operation completes.
 */
async function fetchProductDetails(barcode) {
    console.log("Fetching product details for barcode:", barcode);
    console.log("Product details container:", productDetailsContainer);
    if (!productDetailsContainer) return;
    
    try {
        // Display loading message
        productDetailsContainer.innerHTML = "<p>Fetching product details...</p>";
        
        // Replace with your actual API endpoint
        const response = await fetch(`/product/${barcode}`);
        console.log("Response:", response);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch product details: ${response.status} ${response.statusText}`);
        }
        
        const productData = await response.json();
        displayProductDetails(productData);
    } catch (error) {
        console.error("Error fetching product details:", error);
        productDetailsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to fetch product details: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Displays product details in the product details container.
 * @param {object} productData - The product data to display.
 */
function displayProductDetails(productData) {
    if (!productDetailsContainer) return;
    
    // Clear previous content
    productDetailsContainer.innerHTML = "";
    
    // Create product details card
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    
    // Product header with name and brand
    const productHeader = document.createElement("div");
    productHeader.className = "product-header";
    
    const productName = document.createElement("h2");
    productName.textContent = productData.name || "Unknown Product";
    productHeader.appendChild(productName);
    
    if (productData.brand) {
        const productBrand = document.createElement("p");
        productBrand.className = "product-brand";
        productBrand.textContent = productData.brand;
        productHeader.appendChild(productBrand);
    }
    
    // Barcode display
    const barcodeDisplay = document.createElement("p");
    barcodeDisplay.className = "barcode-display";
    barcodeDisplay.textContent = `Barcode: ${productData.barcode}`;
    
    // Product description
    const productDescription = document.createElement("p");
    productDescription.className = "product-description";
    productDescription.textContent = productData.description || "No description available";
    
    // Category information if available
    const productCategory = document.createElement("p");
    productCategory.className = "product-category";
    if (productData.category) {
        productCategory.innerHTML = `<strong>Category:</strong> ${productData.category}`;
    } else {
        productCategory.innerHTML = "<strong>Category:</strong> Not categorized";
    }
    
    // Add all product details to card
    productCard.appendChild(productHeader);
    productCard.appendChild(barcodeDisplay);
    productCard.appendChild(productDescription);
    productCard.appendChild(productCategory);
    
    // Create store selection and price entry form
    const priceForm = document.createElement("div");
    priceForm.className = "price-form";
    
    const formTitle = document.createElement("h3");
    formTitle.textContent = "Add Price Information";
    priceForm.appendChild(formTitle);
    
    // Store selection
    const storeSelectGroup = document.createElement("div");
    storeSelectGroup.className = "form-group";
    
    const storeLabel = document.createElement("label");
    storeLabel.setAttribute("for", "store-select");
    storeLabel.textContent = "Select Store:";
    storeSelectGroup.appendChild(storeLabel);
    
    const storeSelect = document.createElement("select");
    storeSelect.id = "store-select";
    storeSelect.className = "form-control";
    storeSelectGroup.appendChild(storeSelect);
    
    // Add loading option
    const loadingOption = document.createElement("option");
    loadingOption.value = "";
    loadingOption.textContent = "Loading stores...";
    storeSelect.appendChild(loadingOption);
    
    // Price input
    const priceGroup = document.createElement("div");
    priceGroup.className = "form-group";
    
    const priceLabel = document.createElement("label");
    priceLabel.setAttribute("for", "price-input");
    priceLabel.textContent = "Price:";
    priceGroup.appendChild(priceLabel);
    
    const priceInputWrapper = document.createElement("div");
    priceInputWrapper.className = "price-input-wrapper";
    
    const currencySymbol = document.createElement("span");
    currencySymbol.className = "currency-symbol";
    currencySymbol.textContent = "$";
    priceInputWrapper.appendChild(currencySymbol);
    
    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.id = "price-input";
    priceInput.className = "form-control";
    priceInput.min = "0";
    priceInput.step = "0.01";
    priceInput.placeholder = "0.00";
    priceInputWrapper.appendChild(priceInput);
    
    priceGroup.appendChild(priceInputWrapper);
    
    // Submit button
    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn btn-primary";
    submitBtn.textContent = "Save Price";
    submitBtn.onclick = () => saveProductPrice(productData.id);
    
    // Add form elements
    priceForm.appendChild(storeSelectGroup);
    priceForm.appendChild(priceGroup);
    priceForm.appendChild(submitBtn);
    
    // Add price form to product card
    productCard.appendChild(priceForm);
    
    // Add product card to container
    productDetailsContainer.appendChild(productCard);
    
    // Load stores
    fetchStores().then(stores => {
        populateStoreSelect(stores, storeSelect);
    });
}

/**
 * Fetches the list of stores from the API.
 * @returns {Promise<Array>} - A promise that resolves to an array of store objects.
 */
async function fetchStores() {
    try {
        const response = await fetch("/stores");
        
        if (!response.ok) {
            throw new Error(`Failed to fetch stores: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching stores:", error);
        return [];
    }
}

/**
 * Populates the store select dropdown with available stores.
 * @param {Array} stores - The array of store objects.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 */
function populateStoreSelect(stores, selectElement) {
    // Clear existing options
    selectElement.innerHTML = "";
    
    if (stores.length === 0) {
        const noStoresOption = document.createElement("option");
        noStoresOption.value = "";
        noStoresOption.textContent = "No stores available";
        selectElement.appendChild(noStoresOption);
        return;
    }
    
    // Add default prompt
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a store";
    selectElement.appendChild(defaultOption);
    
    // Add store options
    stores.forEach(store => {
        const option = document.createElement("option");
        option.value = store.id;
        option.textContent = `${store.name} - ${store.location}`;
        selectElement.appendChild(option);
    });
}

/**
 * Saves the product price to the database.
 * @param {string} productId - The ID of the product.
 */
async function saveProductPrice(productId) {
    const storeSelect = document.getElementById("store-select");
    const priceInput = document.getElementById("price-input");
    
    // Validate inputs
    if (!storeSelect || !priceInput) {
        console.error("Store select or price input not found");
        return;
    }
    
    const storeId = storeSelect.value;
    const price = priceInput.value;
    
    if (!storeId) {
        alert("Please select a store");
        return;
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        alert("Please enter a valid price");
        return;
    }
    
    try {
        const response = await fetch("/product-price", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id: productId,
                store_id: storeId,
                price: parseFloat(price),
                currency: "USD" // Default currency
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to save price: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Show success message
        alert("Price saved successfully!");
        
        // Clear inputs
        priceInput.value = "";
        storeSelect.selectedIndex = 0;
        
    } catch (error) {
        console.error("Error saving product price:", error);
        alert(`Failed to save price: ${error.message}`);
    }
}

// Ensure library constants are available (usually global when script is included)
// These checks are good practice.
if (typeof Html5QrcodeScanType === "undefined") {
    console.warn("Html5QrcodeScanType is not defined. File scan type options might be affected if not using defaults.");
    // window.Html5QrcodeScanType = { SCAN_TYPE_CAMERA: 0, SCAN_TYPE_FILE: 1 }; // Basic fallback
}

if (typeof Html5QrcodeSupportedFormats === "undefined") {
    console.warn("Html5QrcodeSupportedFormats is not defined. Barcode format support might be affected.");
    // window.Html5QrcodeSupportedFormats = { /* ... basic fallback ... */ };
}

// Optional: You might want to hide the manual input section or the "Stop Camera" button
// initially, and only show them after "Start Camera Scan" is clicked, or manage UI flow
// differently now that Html5QrcodeScanner provides its own UI for starting/stopping within the scanner div.
// For instance, the "Start Camera Scan" button might only render the scanner, and the scanner's
// internal UI would handle actual camera start/stop.
// The provided "Stop Camera" button would then essentially be a "Clear Scanner UI" button.
