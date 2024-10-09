const apiKey = "aa35ffd252msh56b9b86d370dfdcp14af08jsn4bc79a5594d8";
const apiHost = "wft-geo-db.p.rapidapi.com";
const searchBox = document.getElementById("searchBox");
const resultsBody = document.getElementById("resultsBody");
const itemsPerPageInput = document.getElementById("itemsPerPage");
const pagination = document.getElementById("pagination");
let currentPage = 1;
let totalPages = 0;
let debounceTimeout;

// Fetch data from API
async function fetchData(query = "", limit = 5, offset = 0) {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
        }
    };
    const url = `https://${apiHost}/v1/geo/cities?namePrefix=${query}&limit=${limit}&offset=${offset}`;

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Render search results in table
function renderResults(cities) {
    resultsBody.innerHTML = "";
    if (cities.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="3">No results found</td></tr>`;
        return;
    }

    cities.forEach((city, index) => {
        const countryFlagUrl = `https://flagsapi.com/${city.countryCode}/flat/24.png`;
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${city.name}</td>
                <td><img src="${countryFlagUrl}" alt="${city.country}" /> ${city.country}</td>
            </tr>
        `;
        resultsBody.innerHTML += row;
    });
}

// Debounce to limit search requests
function debounce(func, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
}

// Search
async function handleSearch() {
    const query = searchBox.value.trim();
    const limit = parseInt(itemsPerPageInput.value, 10);
    const data = await fetchData(query, limit, (currentPage - 1) * limit);
    renderResults(data.data);
    handlePagination(data.metadata.totalCount);
}

function handlePagination(totalCount) {
    const limit = parseInt(itemsPerPageInput.value, 10);
    totalPages = Math.ceil(totalCount / limit);
    
    pagination.innerHTML = "";
    let maxButtonsToShow = 5;  
    let startPage = Math.max(currentPage - Math.floor(maxButtonsToShow / 2), 1);
    let endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);
    
    if (currentPage > 1) {
        pagination.innerHTML += `<button onclick="navigatePage(${currentPage - 1})">Previous</button>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="navigatePage(${i})">${i}</button>`;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<button onclick="navigatePage(${currentPage + 1})">Next</button>`;
    }
}

function navigatePage(page) {
    currentPage = page;
    handleSearch();
}

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        searchBox.focus();
    }
});

searchBox.addEventListener("keyup", (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
itemsPerPageInput.addEventListener("change", () => {
    currentPage = 1;
    handleSearch();
});

// Initial search
handleSearch();
