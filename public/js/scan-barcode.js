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
const productDetailsContainer = document.getElementById("product-details-container");

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
    
    // Fetch product details using the scanned barcode
    fetchProductDetails(decodedText);
    
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
    if (!productDetailsContainer) return;
    
    try {
        // Display loading message
        productDetailsContainer.innerHTML = "<p>Fetching product details...</p>";
        
        // Replace with your actual API endpoint
        const response = await fetch(`/api/products/barcode/${barcode}`);
        
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
    
    // Create product details elements
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    
    // Product header with name
    const productHeader = document.createElement("div");
    productHeader.className = "product-header";
    
    const productName = document.createElement("h2");
    productName.textContent = productData.name || "Unknown Product";
    productHeader.appendChild(productName);
    
    // Product price
    const productPrice = document.createElement("div");
    productPrice.className = "product-price";
    productPrice.textContent = productData.price ? 
        `$${parseFloat(productData.price).toFixed(2)}` : 
        "Price not available";
    
    // Product image if available
    let productImage = null;
    if (productData.imageUrl) {
        productImage = document.createElement("img");
        productImage.src = productData.imageUrl;
        productImage.alt = productData.name || "Product image";
        productImage.className = "product-image";
    }
    
    // Product description
    const productDescription = document.createElement("p");
    productDescription.className = "product-description";
    productDescription.textContent = productData.description || "No description available";
    
    // Additional details section
    const productDetails = document.createElement("div");
    productDetails.className = "product-details";
    
    // Stock information
    const productStock = document.createElement("p");
    productStock.innerHTML = `<strong>Stock:</strong> ${
        productData.stock !== undefined ? productData.stock : "Unknown"
    }`;
    productDetails.appendChild(productStock);
    
    // Category information if available
    if (productData.category) {
        const productCategory = document.createElement("p");
        productCategory.innerHTML = `<strong>Category:</strong> ${productData.category}`;
        productDetails.appendChild(productCategory);
    }
    
    // Assemble the product card
    productCard.appendChild(productHeader);
    productCard.appendChild(productPrice);
    if (productImage) {
        productCard.appendChild(productImage);
    }
    productCard.appendChild(productDescription);
    productCard.appendChild(productDetails);
    
    // Add to container
    productDetailsContainer.appendChild(productCard);
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
