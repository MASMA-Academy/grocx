"use strict";

console.log("main.js SCRIPT PARSED AND EXECUTING (outside DOMContentLoaded).");

/**
 * @file main.js
 * @description Global JavaScript functionalities, including responsive navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing main.js (inside DOMContentLoaded)...");

    // Log the state of the DOM right before querying
    // console.log("Current document.body.innerHTML:", document.body.innerHTML);

    const hamburgerButton = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('nav .nav-links'); 

    // Test: Try to find the hamburger button by a more direct path if general query fails
    if (!hamburgerButton) {
        console.warn("Initial query for .hamburger-menu failed. Trying more specific query...");
        const navElement = document.querySelector('nav');
        if (navElement) {
            console.log("Nav element found:", navElement);
            // const directHamburger = navElement.querySelector('.hamburger-menu');
            // console.log("Hamburger button via navElement.querySelector:", directHamburger);
        } else {
            console.error("Nav element itself not found!");
        }
    }

    if (hamburgerButton) {
        console.log("Hamburger button FOUND:", hamburgerButton);
    } else {
        console.error("Hamburger button NOT FOUND. Check class '.hamburger-menu' in your HTML navbars.");
        return; // Stop if no button
    }

    if (navLinks) {
        console.log("Nav links container FOUND:", navLinks);
    } else {
        console.error("Nav links container NOT FOUND. Check class '.nav-links' inside <nav> in your HTML.");
        return; // Stop if no nav links
    }

    // Ensure the navLinks has an ID for aria-controls if it doesn't already.
    // The HTML should provide specific IDs like "main-nav-links-scan", etc.
    // This code will use the existing ID or assign a generic one if missing.
    let navLinksId = navLinks.id;
    if (!navLinksId) {
        console.warn("Nav links container does not have an ID. Assigning default 'main-nav-links-default'. Consider adding unique IDs in HTML.");
        navLinksId = "main-nav-links-default";
        navLinks.id = navLinksId;
    }
    hamburgerButton.setAttribute('aria-controls', navLinksId);
    // Set initial aria-expanded based on whether .active class is present (it shouldn't be)
    hamburgerButton.setAttribute('aria-expanded', navLinks.classList.contains('active').toString());


    hamburgerButton.addEventListener('click', () => {
        console.log("Hamburger CLICKED!");
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        hamburgerButton.setAttribute('aria-expanded', isExpanded.toString());
        console.log("Nav links 'active' class toggled. Now isExpanded:", isExpanded);
        console.log("Current navLinks classes:", navLinks.classList);
    });
    console.log("Event listener ADDED to hamburger button.");

    // Check initial state on load (for debugging)
    if (navLinks.classList.contains('active')) {
      console.warn("WARNING: Nav links container has 'active' class on initial load!");
    } else {
      console.log("Nav links container does NOT have 'active' class on initial load (correct).");
    }
}); 