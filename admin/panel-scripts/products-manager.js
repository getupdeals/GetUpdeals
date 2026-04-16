// ======================== PRODUCT MANAGER (No Variants, No Stock, No Coupon/Expiry/Returns) ========================
const db = firebase.firestore();
const storage = firebase.storage();
const rtdb = firebase.database();

// ---------- Helpers ----------
function slugify(t) { return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"); }
async function uploadImage(file, path) { if(!file) return null; const ref = storage.ref(path); await ref.put(file); return await ref.getDownloadURL(); }
function escapeHtml(str) { if(!str) return ""; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
function escapeAttr(str) { if(!str) return ""; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function capitalizeWords(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// ---------- Category Management ----------
const catSelect = document.getElementById("catSelect"), subcatSelect = document.getElementById("subcatSelect"), subsubcatSelect = document.getElementById("subsubcatSelect");
const newCategoryName = document.getElementById("newCategoryName"), newSubcategoryName = document.getElementById("newSubcategoryName"), newSubsubcategoryName = document.getElementById("newSubsubcategoryName");
const categoryImage = document.getElementById("categoryImage"), subcategoryImage = document.getElementById("subcategoryImage"), subsubcategoryImage = document.getElementById("subsubcategoryImage");
const addCategoryBtn = document.getElementById("addCategoryBtn"), addSubcategoryBtn = document.getElementById("addSubcategoryBtn"), addSubsubcategoryBtn = document.getElementById("addSubsubcategoryBtn");

function resetCategoryState() {
    subcatSelect.innerHTML = '<option value="">Select Subcategory</option>'; subsubcatSelect.innerHTML = '<option value="">Select Sub-Subcategory</option>';
    subcatSelect.disabled = true; subsubcatSelect.disabled = true;
    newSubcategoryName.disabled = true; newSubsubcategoryName.disabled = true;
    subcategoryImage.disabled = true; subsubcategoryImage.disabled = true;
    addSubcategoryBtn.disabled = true; addSubsubcategoryBtn.disabled = true;
}
async function loadCategories(selectedId = "") {
    catSelect.innerHTML = '<option value="">Select Category</option>';
    const snap = await db.collection("categories").orderBy("name").get();
    snap.forEach(d => { catSelect.innerHTML += `<option value="${d.id}">${escapeHtml(d.data().name)}</option>`; });
    if(selectedId) { catSelect.value = selectedId; catSelect.dispatchEvent(new Event("change")); }
}
async function loadSubcategories(categoryId, selectedId = "") {
    subcatSelect.innerHTML = '<option value="">Select Subcategory</option>';
    const snap = await db.collection("subcategories").doc(categoryId).collection("list").orderBy("name").get();
    snap.forEach(d => { subcatSelect.innerHTML += `<option value="${d.id}">${escapeHtml(d.data().name)}</option>`; });
    if(selectedId) { subcatSelect.value = selectedId; subcatSelect.dispatchEvent(new Event("change")); }
}
catSelect.onchange = async () => {
    subcatSelect.innerHTML = '<option value="">Select Subcategory</option>'; subsubcatSelect.innerHTML = '<option value="">Select Sub-Subcategory</option>';
    subcatSelect.disabled = true; subsubcatSelect.disabled = true;
    newSubcategoryName.disabled = true; newSubsubcategoryName.disabled = true;
    subcategoryImage.disabled = true; subsubcategoryImage.disabled = true;
    addSubcategoryBtn.disabled = true; addSubsubcategoryBtn.disabled = true;
    if(!catSelect.value) return;
    subcatSelect.disabled = false; newSubcategoryName.disabled = false; subcategoryImage.disabled = false; addSubcategoryBtn.disabled = false;
    await loadSubcategories(catSelect.value);
};
subcatSelect.onchange = async () => {
    subsubcatSelect.innerHTML = '<option value="">Select Sub-Subcategory</option>'; subsubcatSelect.disabled = true;
    newSubsubcategoryName.disabled = true; subsubcategoryImage.disabled = true; addSubsubcategoryBtn.disabled = true;
    if(!subcatSelect.value) return;
    subsubcatSelect.disabled = false; newSubsubcategoryName.disabled = false; subsubcategoryImage.disabled = false; addSubsubcategoryBtn.disabled = false;
    const snap = await db.collection("subsubcategories").doc(catSelect.value).collection(subcatSelect.value).orderBy("name").get();
    snap.forEach(d => { subsubcatSelect.innerHTML += `<option value="${d.id}">${escapeHtml(d.data().name)}</option>`; });
};
addCategoryBtn.onclick = async () => {
    const name = capitalizeWords(newCategoryName.value.trim()); if(!name) return alert("Enter category name");
    const id = slugify(name); const existing = await db.collection("categories").doc(id).get();
    if(existing.exists) return alert("Category exists");
    const imgUrl = categoryImage.files[0] ? await uploadImage(categoryImage.files[0], `categories/${id}/cover.jpg`) : null;
    await db.collection("categories").doc(id).set({ name, image: imgUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    newCategoryName.value = ""; categoryImage.value = ""; loadCategories(id);
};
addSubcategoryBtn.onclick = async () => {
    const catId = catSelect.value; if(!catId) return alert("Select category");
    const name = capitalizeWords(newSubcategoryName.value.trim()); if(!name) return alert("Enter subcategory name");
    const id = slugify(name); const imgUrl = subcategoryImage.files[0] ? await uploadImage(subcategoryImage.files[0], `subcategories/${catId}/${id}/cover.jpg`) : null;
    await db.collection("subcategories").doc(catId).collection("list").doc(id).set({ name, image: imgUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    newSubcategoryName.value = ""; subcategoryImage.value = ""; await loadSubcategories(catId, id);
};
addSubsubcategoryBtn.onclick = async () => {
    const catId = catSelect.value, subId = subcatSelect.value; if(!subId) return alert("Select subcategory");
    const name = capitalizeWords(newSubsubcategoryName.value.trim()); if(!name) return alert("Enter sub-subcategory name");
    const id = slugify(name); const imgUrl = subsubcategoryImage.files[0] ? await uploadImage(subsubcategoryImage.files[0], `subsubcategories/${catId}/${subId}/${id}/cover.jpg`) : null;
    await db.collection("subsubcategories").doc(catId).collection(subId).doc(id).set({ name, image: imgUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    newSubsubcategoryName.value = ""; subsubcategoryImage.value = ""; subsubcatSelect.value = id;
};

// ---------- Products Table Logic (Sold column) ----------
let allProducts = [], filteredProducts = [], currentPage = 1, itemsPerPage = 10;
const productsTbody = document.getElementById("productsTableBody");
const searchInput = document.getElementById("searchProducts");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const sortBy = document.getElementById("sortBy");
const prevPageBtn = document.getElementById("prevPage"), nextPageBtn = document.getElementById("nextPage"), pageInfo = document.getElementById("pageInfo");

async function loadProductsIntoMemory() {
    const snap = await db.collection("products").get();
    allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const clicksSnap = await rtdb.ref("clicks").once("value");
    const clicksMap = {};
    if(clicksSnap.exists()){
        Object.values(clicksSnap.val()).forEach(userClicks => {
            Object.values(userClicks).forEach(click => {
                if(click.productId) clicksMap[click.productId] = (clicksMap[click.productId] || 0) + 1;
            });
        });
    }
    allProducts = allProducts.map(p => ({ ...p, clickCount: clicksMap[p.id] || 0 }));
    applyFiltersAndRender();
}
function applyFiltersAndRender() {
    let filtered = [...allProducts];
    const searchTerm = searchInput.value.toLowerCase();
    if(searchTerm) filtered = filtered.filter(p => p.title?.toLowerCase().includes(searchTerm) || p.id.toLowerCase().includes(searchTerm));
    const cat = categoryFilter.value;
    if(cat !== "all") filtered = filtered.filter(p => p.category === cat);
    const stat = statusFilter.value;
    if(stat !== "all") filtered = filtered.filter(p => p.status === stat);
    const sort = sortBy.value;
    if(sort === "price_asc") filtered.sort((a,b) => (a.price||0) - (b.price||0));
    else if(sort === "price_desc") filtered.sort((a,b) => (b.price||0) - (a.price||0));
    else if(sort === "date_desc") filtered.sort((a,b) => (b.createdAt?.toMillis?.()||0) - (a.createdAt?.toMillis?.()||0));
    filteredProducts = filtered;
    currentPage = 1;
    renderTablePage();
}
function renderTablePage() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const start = (currentPage-1)*itemsPerPage, end = start+itemsPerPage;
    const pageItems = filteredProducts.slice(start, end);
    if(pageItems.length === 0 && filteredProducts.length === 0) { productsTbody.innerHTML = '<tr><td colspan="8" class="loading-placeholder">No products found.复制'; }
    else {
        productsTbody.innerHTML = pageItems.map(p => `
            <tr>
                <td><div class="product-name-cell"><img src="${escapeHtml(p.image||'')}" class="product-thumb" onerror="this.src='https://placehold.co/44x44'"><span class="product-name">${escapeHtml(p.title||'')}</span></div></td>
                <td>${escapeHtml(p.category||'')}</td>
                <td><span class="stock-badge">${p.sold !== undefined ? p.sold : 0}</span></td>
                <td>₹${(p.originalPrice||0).toLocaleString()}</td>
                <td>₹${(p.price||0).toLocaleString()}</td>
                <td>${p.clickCount || 0}</td>
                <td><span class="status-badge ${p.status==='active'?'status-active':'status-inactive'}">${p.status||'inactive'}</span></td>
                <td><div class="action-buttons"><button class="action-btn edit" data-id="${p.id}"><i class="fas fa-edit"></i></button><button class="action-btn delete" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button></div></td>
            </tr>
        `).join("");
    }
    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}
function nextPage() { if(currentPage < Math.ceil(filteredProducts.length/itemsPerPage)) { currentPage++; renderTablePage(); } }
function prevPage() { if(currentPage > 1) { currentPage--; renderTablePage(); } }
prevPageBtn.onclick = prevPage; nextPageBtn.onclick = nextPage;
searchInput.oninput = applyFiltersAndRender;
categoryFilter.onchange = applyFiltersAndRender;
statusFilter.onchange = applyFiltersAndRender;
sortBy.onchange = applyFiltersAndRender;

// ---------- Product Modal (Add/Edit - no variants, no stock) ----------
let currentEditId = null;
let isSaving = false;
const modal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");
const productIdField = document.getElementById("productId");
const productTitle = document.getElementById("productTitle"), productBrand = document.getElementById("productBrand");
const productCategory = document.getElementById("productCategory"), productSubcategory = document.getElementById("productSubcategory"), productSubsubcategory = document.getElementById("productSubsubcategory");
const productOriginalPrice = document.getElementById("productOriginalPrice"), productPrice = document.getElementById("productPrice");
const discountLabel = document.getElementById("discountLabel"), calcDiscountBtn = document.getElementById("calcDiscountBtn");
const productSold = document.getElementById("productSold"), productRating = document.getElementById("productRating"), productTags = document.getElementById("productTags");
const productMainImage = document.getElementById("productMainImage"), productGallery = document.getElementById("productGallery");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const affiliateLinksContainer = document.getElementById("affiliateLinksContainer");
const affiliateBadgesContainer = document.getElementById("affiliateBadgesContainer");
const downloadsContainer = document.getElementById("downloadsContainer");
const specificationsContainer = document.getElementById("specificationsContainer");
const extraFieldsContainer = document.getElementById("extraFieldsContainer");
const productDescription = document.getElementById("productDescription"), productStatus = document.getElementById("productStatus");
const saveBtn = document.getElementById("saveProductBtn");

// Populate category dropdowns for product form
function populateCategorySelects() {
    db.collection("categories").orderBy("name").get().then(snap => {
        productCategory.innerHTML = '<option value="">Select Category</option>';
        snap.forEach(d => { productCategory.innerHTML += `<option value="${d.id}">${escapeHtml(d.data().name)}</option>`; });
    });
}
productCategory.onchange = async () => {
    productSubcategory.innerHTML = '<option value="">Select Subcategory</option>'; productSubsubcategory.innerHTML = '<option value="">Select Sub-subcategory</option>';
    productSubsubcategory.disabled = true;
    if(!productCategory.value) { productSubcategory.disabled = true; return; }
    productSubcategory.disabled = false;
    const snap = await db.collection("subcategories").doc(productCategory.value).collection("list").orderBy("name").get();
    snap.forEach(d => { productSubcategory.innerHTML += `<option value="${d.id}">${escapeHtml(d.data().name)}</option>`; });
};
productSubcategory.onchange = async () => {
    productSubsubcategory.innerHTML = '<option value="">Select Sub-subcategory</option>';
    if(!productSubcategory.value) { productSubsubcategory.disabled = true; return; }
    productSubsubcategory.disabled = false;
    const snap = await db.collection("subsubcategories").doc(productCategory.value).collection(productSubcategory.value).orderBy("name").get();
    snap.forEach(d => { productSubsubcategory.innerHTML += `<option value="${d.id}">${escapeHtml(d.data().name)}</option>`; });
};

calcDiscountBtn.onclick = () => {
    const price = parseFloat(productPrice.value), original = parseFloat(productOriginalPrice.value);
    if(price && original && original>0) { const disc = Math.round(((original-price)/original)*100); discountLabel.value = `${disc}% OFF`; }
    else alert("Enter both original and deal price");
};

// Dynamic rows for affiliate links, badges, downloads, specs, extra fields
function addAffiliateRow(store="", url="") {
    const div = document.createElement("div"); div.className = "dynamic-row";
    div.innerHTML = `<input type="text" placeholder="Store name" value="${escapeAttr(store)}"><input type="url" placeholder="Affiliate URL" value="${escapeAttr(url)}"><button type="button" class="remove-row">&times;</button>`;
    div.querySelector(".remove-row").onclick = () => div.remove();
    affiliateLinksContainer.appendChild(div);
}
function addAffiliateBadgeRow(badge="") {
    const div = document.createElement("div"); div.className = "dynamic-row";
    div.innerHTML = `<input type="text" placeholder="Badge text" value="${escapeAttr(badge)}"><button type="button" class="remove-row">&times;</button>`;
    div.querySelector(".remove-row").onclick = () => div.remove();
    affiliateBadgesContainer.appendChild(div);
}
function addDownloadRow(name="", url="") {
    const div = document.createElement("div"); div.className = "dynamic-row";
    div.innerHTML = `<input type="text" placeholder="File name" value="${escapeAttr(name)}"><input type="url" placeholder="File URL" value="${escapeAttr(url)}"><button type="button" class="remove-row">&times;</button>`;
    div.querySelector(".remove-row").onclick = () => div.remove();
    downloadsContainer.appendChild(div);
}
function addSpecificationRow(name="", value="") {
    const div = document.createElement("div"); div.className = "dynamic-row";
    div.innerHTML = `<input type="text" placeholder="Attribute" value="${escapeAttr(name)}"><input type="text" placeholder="Value" value="${escapeAttr(value)}"><button type="button" class="remove-row">&times;</button>`;
    div.querySelector(".remove-row").onclick = () => div.remove();
    specificationsContainer.appendChild(div);
}
function addExtraFieldRow(key="", val="") {
    const div = document.createElement("div"); div.className = "dynamic-row";
    div.innerHTML = `<input type="text" placeholder="Field name" value="${escapeAttr(key)}"><input type="text" placeholder="Value" value="${escapeAttr(val)}"><button type="button" class="remove-row">&times;</button>`;
    div.querySelector(".remove-row").onclick = () => div.remove();
    extraFieldsContainer.appendChild(div);
}

// Attach button handlers
document.getElementById("addAffiliateLinkBtn").onclick = () => addAffiliateRow();
document.getElementById("addAffiliateBadgeBtn").onclick = () => addAffiliateBadgeRow();
document.getElementById("addDownloadBtn").onclick = () => addDownloadRow();
document.getElementById("addSpecificationBtn").onclick = () => addSpecificationRow();
document.getElementById("addExtraFieldBtn").onclick = () => addExtraFieldRow();

// Image preview for main/gallery
function previewImages(files, container) {
    container.innerHTML = "";
    if(!files) return;
    Array.from(files).slice(0,8).forEach(f => { const img = document.createElement("img"); img.src = URL.createObjectURL(f); container.appendChild(img); });
}
productMainImage.onchange = () => previewImages(productMainImage.files, imagePreviewContainer);
productGallery.onchange = () => previewImages(productGallery.files, imagePreviewContainer);

// Price history helper
async function updatePriceHistory(productId, oldPrice, newPrice) {
    if(oldPrice === newPrice) return;
    const productRef = db.collection("products").doc(productId);
    const doc = await productRef.get();
    if(!doc.exists) return;
    const currentHistory = doc.data().priceHistory || [];
    const newEntry = { date: new Date().toISOString().split('T')[0], price: newPrice };
    currentHistory.push(newEntry);
    if(currentHistory.length > 30) currentHistory.shift();
    await productRef.update({ priceHistory: currentHistory });
}

// Save product (no variants)
async function saveProduct() {
    if (isSaving) return;
    isSaving = true;
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
        let title = capitalizeWords(productTitle.value.trim());
        if(!title) throw new Error("Title required");
        const price = parseFloat(productPrice.value);
        if(isNaN(price)) throw new Error("Deal price required");
        const originalPrice = parseFloat(productOriginalPrice.value) || null;
        let brand = productBrand.value.trim();
        if (brand) brand = capitalizeWords(brand);
        const category = productCategory.value;
        if(!category) throw new Error("Select category");
        const subcategory = productSubcategory.value || "";
        const subsubcategory = productSubsubcategory.value || "";
        const sold = parseInt(productSold.value) || 0;
        let rating = parseFloat(productRating.value) || 0;
        if (rating < 0) rating = 0;
        if (rating > 5) rating = 5;
        const tags = productTags.value.split(",").map(t=>capitalizeWords(t.trim())).filter(t=>t);
        const description = productDescription.value;
        const status = productStatus.value;
        
        const affiliateLinks = Array.from(affiliateLinksContainer.querySelectorAll(".dynamic-row")).map(row => {
            const inputs = row.querySelectorAll("input");
            return { store: capitalizeWords(inputs[0].value.trim()), url: inputs[1].value.trim() };
        }).filter(l => l.store && l.url);
        
        const affiliateBadges = Array.from(affiliateBadgesContainer.querySelectorAll(".dynamic-row")).map(row => {
            return capitalizeWords(row.querySelector("input").value.trim());
        }).filter(b => b);
        
        const downloads = Array.from(downloadsContainer.querySelectorAll(".dynamic-row")).map(row => {
            const inputs = row.querySelectorAll("input");
            return { name: capitalizeWords(inputs[0].value.trim()), url: inputs[1].value.trim() };
        }).filter(d => d.name && d.url);
        
        const specifications = {};
        Array.from(specificationsContainer.querySelectorAll(".dynamic-row")).forEach(row => {
            const inputs = row.querySelectorAll("input");
            if(inputs[0].value && inputs[1].value) specifications[capitalizeWords(inputs[0].value.trim())] = capitalizeWords(inputs[1].value.trim());
        });
        
        const extraFields = {};
        Array.from(extraFieldsContainer.querySelectorAll(".dynamic-row")).forEach(row => {
            const inputs = row.querySelectorAll("input");
            if(inputs[0].value && inputs[1].value) extraFields[capitalizeWords(inputs[0].value.trim())] = capitalizeWords(inputs[1].value.trim());
        });
        
        let mainImageUrl = null, galleryUrls = [];
        const productId = currentEditId || slugify(title)+"-"+Date.now();
        
        if(productMainImage.files[0]) mainImageUrl = await uploadImage(productMainImage.files[0], `products/${productId}/main.jpg`);
        else if(currentEditId) { const existing = await db.collection("products").doc(productId).get(); if(existing.exists) mainImageUrl = existing.data().image; }
        
        if(productGallery.files.length) {
            for(let i=0; i<Math.min(productGallery.files.length,8); i++) {
                galleryUrls.push(await uploadImage(productGallery.files[i], `products/${productId}/gallery/${i}.jpg`));
            }
        } else if(currentEditId) { const existing = await db.collection("products").doc(productId).get(); if(existing.exists) galleryUrls = existing.data().gallery || []; }
        
        const keywords = `${title} ${brand}`.toLowerCase().split(/\s+/);
        const discount = discountLabel.value ? parseInt(discountLabel.value) : 0;
        const offer = discountLabel.value || "";
        
        const productData = {
            id: productId, title, brand, price, originalPrice, discount, offer,
            sold, rating, tags, category, subcategory, subsubcategory,
            image: mainImageUrl, gallery: galleryUrls,
            affiliateLinks, affiliateBadges, downloads, specifications, extraFields,
            description, status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if(!currentEditId) productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        if(currentEditId) {
            const existing = await db.collection("products").doc(productId).get();
            if(existing.exists && existing.data().price !== price) {
                await updatePriceHistory(productId, existing.data().price, price);
            }
        } else {
            productData.priceHistory = [{ date: new Date().toISOString().split('T')[0], price: price }];
        }
        
        await db.collection("products").doc(productId).set(productData, { merge: true });
        alert("Product saved!");
        modal.style.display = "none";
        await loadProductsIntoMemory();
    } catch (err) {
        alert("Error: " + err.message);
        console.error(err);
    } finally {
        isSaving = false;
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Product";
    }
}
saveBtn.onclick = saveProduct;

// Edit and Delete handlers
document.addEventListener("click", (e) => {
    if(e.target.closest(".edit")) {
        const id = e.target.closest(".edit").dataset.id;
        openEditModal(id);
    }
    if(e.target.closest(".delete")) {
        const id = e.target.closest(".delete").dataset.id;
        const product = allProducts.find(p => p.id === id);
        document.getElementById("deleteProductName").innerText = product?.title || "";
        currentEditId = id;
        document.getElementById("deleteProductModal").style.display = "flex";
    }
});

async function openEditModal(id) {
    const doc = await db.collection("products").doc(id).get();
    if(!doc.exists) return;
    const p = doc.data();
    currentEditId = id;
    modalTitle.innerHTML = "<i class='fas fa-edit'></i> Edit Product";
    productIdField.value = id;
    productTitle.value = p.title;
    productBrand.value = p.brand || "";
    productCategory.value = p.category; await productCategory.dispatchEvent(new Event("change"));
    setTimeout(() => { productSubcategory.value = p.subcategory; productSubcategory.dispatchEvent(new Event("change")); }, 300);
    setTimeout(() => { productSubsubcategory.value = p.subsubcategory; }, 500);
    productOriginalPrice.value = p.originalPrice || ""; productPrice.value = p.price;
    discountLabel.value = p.offer || ""; productSold.value = p.sold || 0;
    productRating.value = p.rating || 0; productTags.value = (p.tags||[]).join(", ");
    productDescription.value = p.description || ""; productStatus.value = p.status || "active";
    
    affiliateLinksContainer.innerHTML = ""; (p.affiliateLinks||[]).forEach(l => addAffiliateRow(l.store, l.url));
    affiliateBadgesContainer.innerHTML = ""; (p.affiliateBadges||[]).forEach(b => addAffiliateBadgeRow(b));
    downloadsContainer.innerHTML = ""; (p.downloads||[]).forEach(d => addDownloadRow(d.name, d.url));
    specificationsContainer.innerHTML = ""; if(p.specifications) Object.entries(p.specifications).forEach(([k,v]) => addSpecificationRow(k,v));
    extraFieldsContainer.innerHTML = ""; if(p.extraFields) Object.entries(p.extraFields).forEach(([k,v]) => addExtraFieldRow(k,v));
    
    imagePreviewContainer.innerHTML = ""; if(p.image) { const img = document.createElement("img"); img.src = p.image; imagePreviewContainer.appendChild(img); }
    modal.style.display = "flex";
}

document.getElementById("confirmDeleteProductBtn").onclick = async () => {
    if(currentEditId) { await db.collection("products").doc(currentEditId).delete(); alert("Deleted"); loadProductsIntoMemory(); }
    document.getElementById("deleteProductModal").style.display = "none";
};
document.querySelectorAll(".modal-close, .modal-cancel").forEach(el => el.onclick = () => { modal.style.display = "none"; document.getElementById("deleteProductModal").style.display = "none"; });
document.getElementById("addProductBtn").onclick = () => {
    currentEditId = null;
    modalTitle.innerHTML = "<i class='fas fa-plus-circle'></i> Add Product";
    // Reset form fields (no stock, no variants)
    document.getElementById("productModal").querySelectorAll("input, select, textarea").forEach(f => { if(f.type !== "file") f.value = ""; });
    productSold.value = "0";
    affiliateLinksContainer.innerHTML = ""; affiliateBadgesContainer.innerHTML = ""; downloadsContainer.innerHTML = "";
    specificationsContainer.innerHTML = ""; extraFieldsContainer.innerHTML = "";
    imagePreviewContainer.innerHTML = "";
    productCategory.value = ""; productSubcategory.innerHTML = '<option value="">Select Subcategory</option>'; productSubsubcategory.innerHTML = '<option value="">Select Sub-subcategory</option>';
    modal.style.display = "flex";
};

// Load category filter dropdown & initial data
async function loadCategoryFilter() {
    const snap = await db.collection("categories").orderBy("name").get();
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    snap.forEach(d => { categoryFilter.innerHTML += `<option value="${d.id}">${escapeHtml(d.data().name)}</option>`; });
}

resetCategoryState();
loadCategories();
loadCategoryFilter();
loadProductsIntoMemory();
populateCategorySelects();