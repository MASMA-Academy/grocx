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
            barcodeInputElement.value = ""; // Clear the input field
        } else {
            scanResultElement.textContent = "Please enter a barcode value.";
        }
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
