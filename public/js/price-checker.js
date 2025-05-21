window.checkPrice = function () {
  const items = [
    { barcode: "123", name: "Apple", price: 1.2 },
    { barcode: "456", name: "Banana", price: 0.8 },
  ];

  const barcode = document.getElementById("barcode").value;
  const item = items.find(i => i.barcode === barcode);
  const result = document.getElementById("result");

  result.innerText = item
    ? `${item.name} - $${item.price}`
    : "Item not found.";
};
