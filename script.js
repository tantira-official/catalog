
document.addEventListener('DOMContentLoaded', () => {
  const sheetURL = https://docs.google.com/spreadsheets/d/e/2PACX-1vSn_yS_cn36zbGYH64wdfOzPMIRtelkC674PZ98X9OmSeH5Pfyz_fkJPfBYFrqmOZU7hrQ5RpPuaNiI/pubhtml;
  Tabletop.init({
    key: sheetURL,
    simpleSheet: true,
    callback: renderProducts
  });

  document.getElementById('search').addEventListener('input', filterProducts);
  document.getElementById('category-filter').addEventListener('change', filterProducts);

  setupLightbox();
});

let allProducts = [];

function renderProducts(data) {
  allProducts = data.filter(p => p.Inventory_Status === 'In Stock' && p.Listing_Status === 'Published');
  populateCategories(allProducts);
  updateProductList(allProducts);
}

function populateCategories(products) {
  const categories = new Set(products.map(p => p.Category).filter(Boolean));
  const filter = document.getElementById('category-filter');
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });
}

function filterProducts() {
  const query = document.getElementById('search').value.toLowerCase();
  const category = document.getElementById('category-filter').value;
  const filtered = allProducts.filter(p => {
    return (!query || p.Name.toLowerCase().includes(query)) &&
           (category === 'All' || p.Category === category);
  });
  updateProductList(filtered);
}

function updateProductList(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';
  products.forEach(product => {
    const images = (product.Images || '').split(',').map(url => url.trim());
    const imageHTML = images.map(url =>
      `<img src="\${url}" alt="\${product.Name}" onclick="openLightbox('\${url}')" />`
    ).join('');
    const html = \`
      <div class="product-card">
        <div class="product-images">\${imageHTML}</div>
        <h2>\${product.Name}</h2>
        <p>\${product.Description}</p>
        <div class="price">
          <s>₹\${product.Price}</s> ₹\${product.Discounted_Price}
        </div>
        <a class="whatsapp-btn" target="_blank"
          href="https://wa.me/919164488088?text=I'm%20interested%20in%20\${encodeURIComponent(product.Name)}">
          Message on WhatsApp
        </a>
      </div>
    \`;
    container.insertAdjacentHTML('beforeend', html);
  });
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  document.getElementById('lightbox-close').onclick = () => {
    lightbox.classList.add('hidden');
  };
  window.openLightbox = function(url) {
    lightboxImg.src = url;
    lightbox.classList.remove('hidden');
  };
}
