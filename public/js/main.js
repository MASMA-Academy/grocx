"use strict";

/**
 * @file main.js
 * @description Global JavaScript functionalities, including responsive navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.querySelector('.hamburger-menu');
    // Use a more specific selector if multiple .nav-links elements might exist,
    // for instance, if some pages have footers with .nav-links.
    // Assuming the main navigation's links container can be uniquely identified,
    // e.g. by an ID or by being a direct child of <nav>.
    // For now, let's assume there's only one primary .nav-links targeted by the hamburger.
    const navLinks = document.querySelector('nav .nav-links'); 

    if (hamburgerButton && navLinks) {
        // Ensure the navLinks has an ID for aria-controls if it doesn't already
        if (!navLinks.id) {
            navLinks.id = "main-nav-links"; // Assign a default ID
        }
        hamburgerButton.setAttribute('aria-controls', navLinks.id);

        hamburgerButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            hamburgerButton.setAttribute('aria-expanded', isExpanded.toString());
        });
    } else {
        if (!hamburgerButton) console.log("Hamburger button not found.");
        if (!navLinks) console.log("Nav links container not found inside nav.");
    }
}); 