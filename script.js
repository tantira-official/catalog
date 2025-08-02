document.addEventListener('DOMContentLoaded', () => {
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(fetchSheet);

  document.getElementById('search').addEventListener('input', filterProducts);
  document.getElementById('category-filter').addEventListener('change', filterProducts);

  setupLightbox();
});

let allProducts = [];

function fetchSheet() {
  const query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1PJKCYjYcr1bYvX6hV8IpDecJlHVuAZTmOcn4x2dAE-Y/gviz/tq?sheet=Product_Catalog');
  query.send(handleResponse);
}

function handleResponse(response) {
  if (response.isError()) {
    console.error('Error in query: ' + response.getMessage());
    return;
  }

  const data = response.getDataTable();
  const rows = data.getNumberOfRows();
  const cols = data.getNumberOfColumns();
  const result = [];

  for (let i = 0; i < rows; i++) {
    let row = {};
    for (let j = 0; j < cols; j++) {
      row[data.getColumnLabel(j)] = data.getValue(i, j);
    }
    result.push(row);
  }

  renderProducts(result);
}

function renderProducts(data) {
  allProducts = data.filter(p => p.Inventory_Status === 'In Stock' && p.Listing_Status === 'Published');
  populateCategories(allProducts);
  updateProductList(allProducts);
}

function populateCategories(products) {
  const categories = new Set(products.map(p => p.Category).filter(Boolean));
  const filter = document.getElementById('category-filter');
  filter.innerHTML = '<option value="All">All Categories</option>';
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
      `<img src="${url}" alt="${product.Name}" onclick="openLightbox('${url}')" />`
    ).join('');
    const html = `
      <div class="product-card">
        <div class="product-images">${imageHTML}</div>
        <h2>${product.Name}</h2>
        <p>${product.Description}</p>
        <div class="price">
          <s>₹${product.Price}</s> ₹${product.Discounted_Price}
        </div>
        <a class="whatsapp-btn" target="_blank"
          href="https://wa.me/919164488088?text=I'm%20interested%20in%20${encodeURIComponent(product.Name)}">
          Message on WhatsApp
        </a>
      </div>
    `;
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