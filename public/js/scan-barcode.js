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
 * Main container for the scanner UI.
 * @type {HTMLElement | null}
 */
const scannerContainerElement = document.getElementById("scanner-container");

/**
 * DOM element where the html5-qrcode scanner will be rendered.
 * @type {HTMLElement | null}
 */
const scannerRenderElement = document.getElementById("scanner");

/**
 * DOM element to display product details.
 * @type {HTMLElement | null}
 */
let productDetailsContainer = document.getElementById("product-details-container");

// Create product details container if it doesn't exist
if (!productDetailsContainer) {
    console.log("Creating product details container as it doesn't exist in HTML.");
    productDetailsContainer = document.createElement("div");
    productDetailsContainer.id = "product-details-container";
    productDetailsContainer.className = "product-details-container";
    // Ensure it's added to the body or a relevant parent if scannerContainerElement is not the direct parent
    const parentElement = scannerContainerElement ? scannerContainerElement.parentNode : document.body;
    if (parentElement) {
        parentElement.appendChild(productDetailsContainer);
    } else {
        document.body.appendChild(productDetailsContainer);
    }
}
// Initially hide product details
if (productDetailsContainer) {
    productDetailsContainer.style.display = "none";
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
async function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan result: ${decodedText}`, decodedResult);
    if (scanResultElement) {
        scanResultElement.textContent = `Scanned Barcode: ${decodedText}`;
    }

    if (html5QrcodeScanner) {
        try {
            await html5QrcodeScanner.clear(); // Stop camera, clear scanner UI
            console.log("Scanner cleared after success.");
        } catch (error) {
            console.error("Failed to clear scanner after success:", error);
        }
    }
    
    // Hide scanner container and show product details
    if (scannerContainerElement) scannerContainerElement.style.display = "none";
    if (productDetailsContainer) productDetailsContainer.style.display = "block";
    
    console.log("Initiating product fetch from scan success handler");
    fetchProductDetails(decodedText);
}

/**
 * Handles scan failures (optional, as UI provides some feedback).
 * @param {string} error - The error message from the scanner.
 */
function onScanFailure(error) {
    // The html5-qrcode UI usually shows transient errors.
    // This callback is more for persistent errors or custom logging.
    // console.warn(`Scan error reported by library: ${error}`);
    // Example: if (error.includes("NotFoundError") || error.includes("NotAllowedError"))
    // if (scanResultElement) scanResultElement.textContent = "Camera access denied or no camera found. Please check permissions.";
}

/**
 * Initializes and starts the HTML5 QR Code scanner.
 * This will render the scanner UI in the 'scanner' div.
 */
function initAndStartScanner() {
    console.log("Attempting to initialize and start scanner...");

    if (!scannerRenderElement) {
        console.error("Scanner render element with ID 'scanner' not found in DOM.");
        if (scanResultElement) scanResultElement.textContent = "Error: Scanner UI placeholder not found.";
        return;
    }
     if (!scannerContainerElement) {
        console.error("Scanner container element with ID 'scanner-container' not found in DOM.");
        return;
    }

    // Ensure scanner container is visible and product details are hidden
    scannerContainerElement.style.display = "block";
    if (productDetailsContainer) productDetailsContainer.style.display = "none";
    scannerRenderElement.innerHTML = ""; // Clear previous scanner UI if any remnants

    // Configuration for the scanner
    // Assuming Html5QrcodeScanType is globally available from the library
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] // Or window.Html5QrcodeScanType.SCAN_TYPE_CAMERA if namespaced
    };

    // Create a new instance if it doesn't exist or to ensure a fresh state
    // The library's .clear() method should handle stopping the old instance.
    html5QrcodeScanner = new Html5QrcodeScanner(
        "scanner", // ID of the element to render to
        config,
        /* verbose= */ false
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    console.log("Html5QrcodeScanner rendered and started.");
    if (scanResultElement) scanResultElement.textContent = "Scanner active. Point camera at a barcode.";
}

/**
 * Shows the scanner interface and restarts the scanner.
 * Called by "Cancel" buttons or similar actions.
 */
async function showScannerAndRestart() {
    console.log("showScannerAndRestart called.");
    
    // Hide product details, show scanner container
    if (productDetailsContainer) {
        productDetailsContainer.innerHTML = ""; // Clear old details
        productDetailsContainer.style.display = "none";
    }
    if (scannerContainerElement) {
        scannerContainerElement.style.display = "block";
    }

    // If scanner instance exists and might be in a weird state, try to clear it.
    // However, creating a new instance in initAndStartScanner should also handle this.
    if (html5QrcodeScanner) {
        try {
            // Check state before clearing, if possible and if state enum is correctly referenced
            // Example: if (html5QrcodeScanner.getState && html5QrcodeScanner.getState() === Html5QrcodeScannerState.SCANNING) {
            // For simplicity, Html5QrcodeScanner.clear() is robust.
            await html5QrcodeScanner.clear();
            console.log("Previous scanner instance cleared before restarting.");
            //}
        } catch (err) {
            console.warn("Error clearing existing scanner in showScannerAndRestart (might be normal if already cleared):", err);
        }
    }
    initAndStartScanner(); // Initialize and start a fresh scanner
}

// Auto-start scanner when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Auto-starting barcode scanner.");

    if (!document.getElementById("scanner")) {
        console.error("CRITICAL: The 'scanner' div is missing from scan-barcode.html. Cannot initialize scanner.");
        if(scanResultElement) scanResultElement.textContent = "Error: Scanner UI element missing. Cannot start.";
        return;
    }
     if (!scannerContainerElement) {
        console.error("CRITICAL: The 'scanner-container' div is missing from scan-barcode.html. UI may not behave as expected.");
        // Attempt to continue but layout might be broken
    }

    // Ensure product details container exists and is initially hidden
    if (productDetailsContainer) {
        productDetailsContainer.style.display = "none";
    } else {
        // This case should have been handled by the dynamic creation logic at the top
        console.warn("Product details container was not found or created by DOMContentLoaded.");
    }
    
    initAndStartScanner();

    // Setup manual submission if elements exist
    const manualSubmitButton = document.getElementById("manual-submit-btn"); // Assuming a button with this ID
    if (manualSubmitButton && barcodeInputElement) {
        manualSubmitButton.addEventListener("click", () => {
            const barcodeValue = barcodeInputElement.value;
            if (barcodeValue) {
                if (scanResultElement) scanResultElement.textContent = `Manually Entered: ${barcodeValue}`;
                onScanSuccess(barcodeValue, { "source": "manual" }); // Simulate scan success
            } else {
                if (scanResultElement) scanResultElement.textContent = "Please enter a barcode value.";
            }
        });
    }
});

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered successfully:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

/**
 * Fetches product details based on the barcode.
 * If product not found, displays a form to add a new product.
 * @param {string} barcode - The barcode to use for fetching product details.
 * @returns {Promise<void>} - A promise that resolves when the fetch operation completes.
 */
async function fetchProductDetails(barcode) {
    console.log("Fetching product details for barcode:", barcode);
    if (!productDetailsContainer) {
        console.error("Product details container not found!");
        return;
    }
    
    try {
        productDetailsContainer.innerHTML = `<div class="loading-message"><div class="spinner"></div><p>Fetching product details...</p></div>`;
        
        const response = await fetch(`/product/${barcode}`);
        console.log("Response status:", response.status);
        
        if (response.status === 404) {
            console.log("Product not found, displaying new product form.");
            displayNewProductForm(barcode);
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.text(); // Try to get more error details
            throw new Error(`Failed to fetch product details: ${response.status} ${response.statusText}. Server says: ${errorData}`);
        }
        
        const productData = await response.json();
        displayProductDetails(productData);

    } catch (error) {
        console.error("Error fetching product details:", error);
        productDetailsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to fetch product details.</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Displays a form to add a new product.
 * The "Cancel" button in this form should call showScannerAndRestart().
 * @param {string} barcode - The barcode for the new product.
 */
function displayNewProductForm(barcode) {
    if (!productDetailsContainer) return;

    // Ensure productDetailsContainer is visible and scanner is hidden
    if (scannerContainerElement) scannerContainerElement.style.display = "none";
    productDetailsContainer.style.display = "block";

    productDetailsContainer.innerHTML = `
        <div class="product-card new-product-form">
            <div class="product-header">
                 <div class="product-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm1-13h-2v4H7v2h4v4h2v-4h4V9h-4z"/></svg>
                </div>
                <div class="header-content">
                    <h2>Add New Product</h2>
                </div>
            </div>
            <div class="product-content">
                <div class="form-group">
                    <label for="new-product-barcode">Barcode (Scanned)</label>
                    <input type="text" id="new-product-barcode" class="form-control" value="${barcode}" readonly>
                </div>
                <div class="form-group">
                    <label for="new-product-name">Product Name *</label>
                    <input type="text" id="new-product-name" class="form-control" placeholder="Enter product name">
                </div>
                <div class="form-group">
                    <label for="new-product-brand">Brand</label>
                    <input type="text" id="new-product-brand" class="form-control" placeholder="Enter brand (optional)">
                </div>
                <div class="form-group">
                    <label for="new-product-category">Category</label>
                    <input type="text" id="new-product-category" class="form-control" placeholder="Enter category (optional)">
                </div>
                <div class="form-group">
                    <label for="new-product-description">Description</label>
                    <textarea id="new-product-description" class="form-control" rows="3" placeholder="Enter description (optional)"></textarea>
                </div>
                <div class="button-container">
                    <button type="button" class="btn btn-secondary" onclick="showScannerAndRestart()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"/></svg>
                        Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveNewProduct('${barcode}')">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/></svg>
                        Save Product
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Saves the newly entered product data to the backend.
 * @param {string} barcode - The barcode of the new product.
 */
async function saveNewProduct(barcode) {
    const name = document.getElementById("new-product-name").value.trim();
    const brand = document.getElementById("new-product-brand").value.trim();
    const category = document.getElementById("new-product-category").value.trim();
    const description = document.getElementById("new-product-description").value.trim();

    if (!name) {
        alert("Product Name is required.");
        document.getElementById("new-product-name").focus();
        return;
    }

    const productData = {
        barcode,
        name,
        brand: brand || null,
        category: category || null,
        description: description || null,
    };

    console.log("Saving new product:", productData);

    try {
        productDetailsContainer.innerHTML = `<div class="loading-message"><div class="spinner"></div><p>Saving new product...</p></div>`;

        const response = await fetch("/add-product", { // Changed from /product to /add-product
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        // Read the response body once
        let responseBody;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            responseBody = await response.json();
        } else {
            responseBody = await response.text();
        }

        if (!response.ok) {
            let errorDetail = "Could not retrieve error details from server.";
            if (typeof responseBody === "string") {
                errorDetail = responseBody;
            } else if (responseBody && typeof responseBody.message === "string") {
                errorDetail = responseBody.message;
            } else if (responseBody) {
                errorDetail = JSON.stringify(responseBody);
            }
            throw new Error(`Failed to save new product: ${response.status} ${response.statusText}. Server Response: ${errorDetail}`);
        }

        // Assuming server responds with the created product object as JSON
        // responseBody should already be the parsed newProduct if response was ok and JSON
        const newProduct = responseBody; 
        console.log("New product saved:", newProduct);
        alert("New product saved successfully!");

        // Now fetch and display this new product's details (which will include the price form)
        fetchProductDetails(barcode);

    } catch (error) {
        console.error("Error saving new product:", error);
        productDetailsContainer.innerHTML = `
            <div class="error-message">
                 <p>Failed to save new product.</p>
                 <p class="error-details">${error.message}</p>
                 <button class="btn btn-secondary" onclick="displayNewProductForm('${barcode}')">Try Again</button>
            </div>
        `;
    }
}

/**
 * Displays product details.
 * The "Cancel" button in this view should call showScannerAndRestart().
 * The "Add Price" button logic remains.
 * @param {object} productData - The product data to display.
 */
function displayProductDetails(productData) {
    if (!productDetailsContainer) return;

    // Ensure productDetailsContainer is visible and scanner is hidden
    if (scannerContainerElement) scannerContainerElement.style.display = "none";
    productDetailsContainer.style.display = "block";
    
    // Clear previous content
    productDetailsContainer.innerHTML = "";
    
    // Create product details card
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    
    // Product header with name and brand
    const productHeader = document.createElement("div");
    productHeader.className = "product-header";
    
    // Add product icon
    const productIcon = document.createElement("div");
    productIcon.className = "product-icon";
    productIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12,13a1,1,0,1,0,1,1A1,1,0,0,0,12,13ZM12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,8a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V9A1,1,0,0,0,12,8Z"/></svg>';
    productHeader.appendChild(productIcon);
    
    const headerContent = document.createElement("div");
    headerContent.className = "header-content";
    
    const productName = document.createElement("h2");
    productName.textContent = `Product: ${productData.name || "Unknown Product"}`;
    headerContent.appendChild(productName);
    
    if (productData.brand) {
        const productBrand = document.createElement("p");
        productBrand.className = "product-brand";
        productBrand.textContent = productData.brand;
        headerContent.appendChild(productBrand);
    }
    
    productHeader.appendChild(headerContent);
    
    // Barcode display
    const barcodeDisplay = document.createElement("p");
    barcodeDisplay.className = "barcode-display";
    barcodeDisplay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M2,6H4V18H2V6M5,6H6V18H5V6M7,6H10V18H7V6M11,6H12V18H11V6M14,6H16V18H14V6M17,6H20V18H17V6M21,6H22V18H21V6Z"/></svg> ${productData.barcode}`;
    
    // Product content wrapper
    const productContent = document.createElement("div");
    productContent.className = "product-content";
    
    // Category with icon
    if (productData.category) {
        const productCategory = document.createElement("div");
        productCategory.className = "product-detail-row";
        productCategory.innerHTML = `
            <div class="detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M10,3H4A1,1,0,0,0,3,4V10A1,1,0,0,0,4,11H10A1,1,0,0,0,11,10V4A1,1,0,0,0,10,3ZM9,9H5V5H9ZM20,3H14a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,20,3ZM19,9H15V5h4ZM10,13H4a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1H10a1,1,0,0,0,1-1V14A1,1,0,0,0,10,13ZM9,19H5V15H9Zm11-1.06a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19l-.09,0A.88.88,0,0,0,13.05,11l-.1,0H13a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1v-.1ZM14,13.41,18.59,18H14Z"/>
                </svg>
            </div>
            <div class="detail-content">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${productData.category}</span>
            </div>
        `;
        productContent.appendChild(productCategory);
    }
    
    // Description with icon
    if (productData.description) {
        const productDescription = document.createElement("div");
        productDescription.className = "product-detail-row";
        productDescription.innerHTML = `
            <div class="detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM5,5H19V7H5Zm0,4H13v2H5Zm0,4H19v2H5Zm0,4h9v2H5Z"/>
                </svg>
            </div>
            <div class="detail-content">
                <span class="detail-label">Details:</span>
                <span class="detail-value">${productData.description}</span>
            </div>
        `;
        productContent.appendChild(productDescription);
    }
    
    // Create store selection and price entry form
    const priceForm = document.createElement("div");
    priceForm.className = "price-form";
    
    const formTitle = document.createElement("h3");
    formTitle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM15.82,8.49l-4.46,5a1,1,0,0,1-.73.36,1,1,0,0,1-.69-.28l-1.86-1.86a1,1,0,0,1,1.42-1.42l1.11,1.11,3.77-4.21a1,1,0,0,1,1.42,0A1,1,0,0,1,15.82,8.49Z"/></svg> Add Price Information`;
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
    currencySymbol.textContent = "RM";
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
    
    // Button container for Add and Cancel buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    
    // Add button
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-primary";
    addBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"/></svg> Add Price`;
    addBtn.onclick = () => saveProductPrice(productData.id);
    
    // Cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"/></svg> Cancel`;
    cancelBtn.onclick = showScannerAndRestart;
    
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(addBtn);
    
    // Add form elements
    priceForm.appendChild(storeSelectGroup);
    priceForm.appendChild(priceGroup);
    priceForm.appendChild(buttonContainer);
    
    // Create a container for the price history
    const priceHistoryContainer = document.createElement("div");
    priceHistoryContainer.id = "product-price-history-container";
    priceHistoryContainer.className = "price-history-section"; // For styling
    
    // Add all components to card
    productCard.appendChild(productHeader);
    productCard.appendChild(barcodeDisplay);
    productCard.appendChild(productContent);
    productCard.appendChild(priceForm);
    productCard.appendChild(priceHistoryContainer); // Add history container to the card
    
    // Add product card to container
    productDetailsContainer.appendChild(productCard);
    
    // Load stores for the price form
    fetchStores().then(stores => {
        populateStoreSelect(stores, storeSelect);
    });

    // Fetch and display price history for this product
    fetchAndDisplayProductPriceHistory(productData.id, priceHistoryContainer);
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

/**
 * Fetches and displays the price history for a specific product.
 * @param {string} productId - The ID of the product.
 * @param {HTMLElement} targetContainer - The HTML element to render the history into.
 */
async function fetchAndDisplayProductPriceHistory(productId, targetContainer) {
    console.log("Fetching price history for product ID:", productId);
    targetContainer.innerHTML = `<div class="loading-message"><div class="spinner"></div><p>Loading price history...</p></div>`;

    try {
        const response = await fetch(`/product/${productId}/price-history`);
        
        let historyData;
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            let errorDetail = "Could not retrieve error details from server.";
            if (contentType && contentType.includes("application/json")) {
                const errorJson = await response.json();
                errorDetail = errorJson.message || JSON.stringify(errorJson);
            } else {
                errorDetail = await response.text();
            }
            throw new Error(`Failed to fetch price history: ${response.status} ${response.statusText}. Server: ${errorDetail}`);
        }

        if (contentType && contentType.includes("application/json")) {
            historyData = await response.json();
        } else {
            const textData = await response.text();
            throw new Error(`Unexpected response format for price history. Expected JSON, got text: ${textData.substring(0,100)}`);
        }
        
        console.log("Price history data received:", historyData);
        renderPriceHistoryTable(historyData, targetContainer);

    } catch (error) {
        console.error("Error fetching or displaying product price history:", error);
        targetContainer.innerHTML = `
            <div class="error-message">
                <p>Could not load price history.</p>
                <p class="error-details">${error.message}</p>
                <button class="btn btn-sm btn-outline-secondary" onclick="fetchAndDisplayProductPriceHistory('${productId}', document.getElementById('product-price-history-container'))">Retry</button>
            </div>
        `;
    }
}

/**
 * Renders the price history data as a table into the target container.
 * @param {Array} history - Array of price history objects.
 * @param {HTMLElement} container - The HTML element to render the table into.
 */
function renderPriceHistoryTable(history, container) {
    container.innerHTML = ""; // Clear loading message or previous content

    const historyTitle = document.createElement("h3");
    historyTitle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm1-8.41,2.29,2.3a1,1,0,0,1,0,1.42,1,1,0,0,1-1.41,0L11.12,12.7A1,1,0,0,1,11,12V6a1,1,0,0,1,2,0Z"/></svg> Price History`;
    container.appendChild(historyTitle);

    if (!history || history.length === 0) {
        container.innerHTML += "<p>No price history found for this product.</p>";
        return;
    }

    const table = document.createElement("table");
    table.className = "price-history-table styled-table"; // Add class for styling

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    // Modified headers: Removed Currency, Price becomes Amount
    const headers = ["Date", "Store", "Amount"];
    headers.forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    history.forEach(entry => {
        const row = tbody.insertRow();
        
        const dateCell = row.insertCell();
        dateCell.textContent = new Date(entry.created_at).toLocaleDateString();
        
        const storeCell = row.insertCell();
        storeCell.textContent = entry.store_name || "N/A"; // store_name comes from the backend join
        
        // Handle price display and combine with currency
        const amountCell = row.insertCell();
        let formattedPrice;
        if (entry.price === null || entry.price === undefined) {
            formattedPrice = "N/A";
        } else if (typeof entry.price === 'string') {
            // If it's a string, assume it's a large number or already formatted, use as is
            formattedPrice = entry.price;
        } else if (typeof entry.price === 'number') {
            // If it's a number, format to 2 decimal places
            // For very large numbers, toFixed() can be problematic or switch to exponential.
            // However, typical prices should be fine.
            // If entry.price is extremely large like 10e17, toFixed(2) would be 100000000000000000.00
            // which might be what's desired if it's a valid numeric representation.
            formattedPrice = entry.price.toFixed(2);
        } else {
            formattedPrice = "N/A"; // Fallback for other unexpected types
        }
        
        amountCell.textContent = `${entry.currency || "CUR"} ${formattedPrice}`;
    });

    container.appendChild(table);
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
