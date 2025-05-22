"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const historyTableContainer = document.getElementById("full-history-table-container");

    if (!historyTableContainer) {
        console.error("History table container is missing from the History List page.");
        return;
    }

    async function fetchAndDisplayFullHistory() {
        historyTableContainer.innerHTML = `<div class=\"loading-message\"><div class=\"spinner\"></div><p>Loading full price history...</p></div>`;

        try {
            const response = await fetch(`/product-prices/all`); 
            if (!response.ok) {
                const responseText = await response.text(); // Read body as text first
                let errorDetail = responseText;
                try {
                    const errorData = JSON.parse(responseText);
                    errorDetail = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    console.warn("Server error response was not valid JSON:", responseText);
                }
                throw new Error(`Failed to fetch full history: ${response.status} ${response.statusText}. Server: ${errorDetail}`);
            }
            const fullHistory = await response.json();
            displayFullHistoryTable(fullHistory);

        } catch (error) {
            console.error("Error fetching full history:", error);
            historyTableContainer.innerHTML = `<p class=\"error-message\">Error fetching full price history: ${error.message}</p>`;
        }
    }

    function displayFullHistoryTable(historyEntries) {
        historyTableContainer.innerHTML = ""; // Clear loading message

        if (!historyEntries || historyEntries.length === 0) {
            const noHistoryMessage = document.createElement("p");
            noHistoryMessage.className = "info-message";
            noHistoryMessage.textContent = "No price history recorded yet.";
            historyTableContainer.appendChild(noHistoryMessage);
            return;
        }

        const historyTable = document.createElement("table");
        historyTable.className = "history-table"; // Use a more generic class if styles are shared
        historyTable.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Product Name</th>
                    <th>Barcode</th>
                    <th>Brand</th>
                    <th>Store</th>
                    <th>Location</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = historyTable.querySelector("tbody");
        historyEntries.forEach(entry => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${new Date(entry.created_at).toLocaleDateString()}</td>
                <td>${entry.product_name || 'N/A'}</td>
                <td>${entry.product_barcode || 'N/A'}</td>
                <td>${entry.product_brand || 'N/A'}</td>
                <td>${entry.store_name}</td>
                <td>${entry.store_location}</td>
                <td>${entry.currency} ${parseFloat(entry.price).toFixed(2)}</td>
            `;
        });

        historyTableContainer.appendChild(historyTable);
    }

    // Initial load
    fetchAndDisplayFullHistory();
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