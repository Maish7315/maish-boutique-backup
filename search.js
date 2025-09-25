// search.js
export async function fetchProducts() {
  try {
    const res = await fetch("https://maisha-boutique.onrender.com/products");
    const data = await res.json();
    console.log("Fetched data:", data); // Check this in your browser console

    // If API returns { products: [...] }
    if (data.products && Array.isArray(data.products)) {
      return data.products;
    }

    // If API returns just an array
    if (Array.isArray(data)) {
      return data;
    }

    // If neither, return empty
    return [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export function renderProducts(products, query) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const filtered = products.filter(
    (p) =>
      !p.deleted &&
      (p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()))
  );

  if (filtered.length === 0) {
    resultsDiv.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#6b7280;">No products found.</div>`;
    return;
  }

  filtered.forEach((product) => {
    const div = document.createElement("div");
    div.style.backgroundColor = "white";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
    div.style.padding = "16px";
    div.style.display = "flex";
    div.style.flexDirection = "column";

    div.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}" style="width:100%;height:160px;object-fit:contain;margin-bottom:12px;border-radius:4px;">
      <div style="font-weight:600;font-size:16px;margin-bottom:8px;min-height:48px;overflow:hidden;text-overflow:ellipsis;">${product.title}</div>
      <div style="font-size:14px;color:#4b5563;margin-bottom:8px;min-height:32px;overflow:hidden;text-overflow:ellipsis;">${product.description}</div>
      <div style="color:#1d4ed8;font-weight:bold;font-size:18px;margin-bottom:8px;">KSH ${product.price}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Stock: ${product.stock}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Brand: ${product.brand}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Category: ${product.category}</div>
    `;

    resultsDiv.appendChild(div);
  });
}
