"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("product-search-input");
    const searchButton = document.getElementById("search-button");
    const searchResultsContainer = document.getElementById("search-results-container");
    const priceHistoryContainer = document.getElementById("price-history-container");

    if (!searchInput || !searchButton || !searchResultsContainer || !priceHistoryContainer) {
        console.error("One or more elements are missing from the Price Checker page.");
        return;
    }

    searchButton.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            searchResultsContainer.innerHTML = "<p class=\"info-message\">Please enter a product name or barcode to search.</p>";
            priceHistoryContainer.innerHTML = ""; // Clear price history
            return;
        }

        searchResultsContainer.innerHTML = `<div class=\"loading-message\"><div class=\"spinner\"></div><p>Searching for products...</p></div>`;
        priceHistoryContainer.innerHTML = ""; // Clear price history

        try {
            const response = await fetch(`/products/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                const responseText = await response.text(); // Read body as text first
                let errorDetail = responseText;
                try {
                    // Try to parse the text as JSON
                    const errorData = JSON.parse(responseText);
                    errorDetail = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    // If parsing fails, errorDetail remains the responseText
                    console.warn("Server error response was not valid JSON:", responseText);
                }
                throw new Error(`Search failed: ${response.status} ${response.statusText}. Server: ${errorDetail}`);
            }
            
            // If response.ok is true, we expect JSON
            const products = await response.json(); 
            displaySearchResults(products);

        } catch (error) {
            console.error("Error searching products:", error);
            searchResultsContainer.innerHTML = `<p class=\"error-message\">Error searching products: ${error.message}</p>`;
        }
    }

    function displaySearchResults(products) {
        searchResultsContainer.innerHTML = ""; // Clear previous results

        if (!products || products.length === 0) {
            searchResultsContainer.innerHTML = "<p class=\"info-message\">No products found matching your search.</p>";
            return;
        }

        const resultsTitle = document.createElement("h2");
        resultsTitle.textContent = "Search Results";
        searchResultsContainer.appendChild(resultsTitle);

        const productList = document.createElement("ul");
        productList.className = "product-list";

        products.forEach(product => {
            const listItem = document.createElement("li");
            listItem.className = "product-list-item";
            listItem.innerHTML = `
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <span class="product-brand">${product.brand || 'N/A'}</span>
                    <span class="product-barcode">${product.barcode}</span>
                </div>
                <button class="btn btn-secondary view-price-history-btn" data-product-id="${product.id}" data-product-name="${product.name}">
                    View Price History
                </button>
            `;
            productList.appendChild(listItem);
        });

        searchResultsContainer.appendChild(productList);

        document.querySelectorAll(".view-price-history-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const productId = event.currentTarget.dataset.productId;
                const productName = event.currentTarget.dataset.productName;
                fetchAndDisplayPriceHistory(productId, productName);
            });
        });
    }

    async function fetchAndDisplayPriceHistory(productId, productName) {
        priceHistoryContainer.innerHTML = `<div class=\"loading-message\"><div class=\"spinner\"></div><p>Fetching price history for ${productName}...</p></div>`;

        try {
            const response = await fetch(`/product-prices/history/${productId}`);
            if (!response.ok) {
                const responseText = await response.text(); // Read body as text first
                let errorDetail = responseText;
                try {
                    const errorData = JSON.parse(responseText);
                    errorDetail = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    console.warn("Server error response was not valid JSON:", responseText);
                }
                throw new Error(`Failed to fetch price history: ${response.status} ${response.statusText}. Server: ${errorDetail}`);
            }
            const priceHistory = await response.json(); 
            displayPriceHistory(priceHistory, productName);

        } catch (error) {
            console.error("Error fetching price history:", error);
            priceHistoryContainer.innerHTML = `<p class=\"error-message\">Error fetching price history: ${error.message}</p>`;
        }
    }

    function displayPriceHistory(priceHistory, productName) {
        priceHistoryContainer.innerHTML = ""; 

        const historyTitle = document.createElement("h2");
        historyTitle.textContent = `Price History for ${productName}`;
        priceHistoryContainer.appendChild(historyTitle);

        if (!priceHistory || priceHistory.length === 0) {
            const noHistoryMessage = document.createElement("p");
            noHistoryMessage.className = "info-message";
            noHistoryMessage.textContent = "No price history available for this product.";
            priceHistoryContainer.appendChild(noHistoryMessage);
            return;
        }

        const historyTable = document.createElement("table");
        historyTable.className = "price-history-table";
        historyTable.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Store</th>
                    <th>Location</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = historyTable.querySelector("tbody");
        priceHistory.forEach(entry => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${new Date(entry.created_at).toLocaleDateString()}</td>
                <td>${entry.store_name}</td>
                <td>${entry.store_location}</td>
                <td>${entry.currency} ${parseFloat(entry.price).toFixed(2)}</td>
            `;
        });

        priceHistoryContainer.appendChild(historyTable);
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
