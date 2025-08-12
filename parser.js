/**
 *
 * @param {string} content
 */
function opengraphContentProcessing(content) {
  return content.split("—")[0].trim();
}

function getOpengraph() {
  return Object.fromEntries(
    Array.from(document.querySelectorAll("meta[property]")).map((item) => [
      item.getAttribute("property").split(":")[1],
      opengraphContentProcessing(item.getAttribute("content")),
    ])
  );
}

function getCurrencyTextBySymbol(s) {
  switch (s) {
    case "₽":
      return "RUB";
    case "$":
      return "USD";
    case "€":
      return "EUR";
    default:
      return "";
  }
}

function getProperties() {
  const getSpanByIndex = (prop, i) =>
    prop.querySelectorAll("span")[i].textContent.trim();

  return Object.fromEntries(
    Array.from(document.querySelectorAll(".about > .properties > li")).map(
      (prop) => [getSpanByIndex(prop, 0), getSpanByIndex(prop, 1)]
    )
  );
}

function getDescription() {
  const el = document.querySelector(".about .description").cloneNode(true);
  el.querySelector(".unused").removeAttribute("class");
  return el.innerHTML.trim();
}

function getImages() {
  return Array.from(document.querySelectorAll(".preview button > img")).map(
    (item) => ({
      preview: item.getAttribute("src"),
      full: item.dataset.src,
      alt: item.getAttribute("alt"),
    })
  );
}

function getAdditionalProducts() {
  return Array.from(document.querySelectorAll(".suggested .items article")).map(
    (article) => ({
      name: article.querySelector("h3").textContent,
      description: article.querySelector("p").textContent,
      image: article.querySelector("img").getAttribute("src"),
      price: article.querySelector("b").textContent.replaceAll(/[₽$€]/g, ""),
      currency: getCurrencyTextBySymbol(
        article.querySelector("b").innerText.match(/([₽$€])/)[1]
      ),
    })
  );
}

function getReviews() {
  return Array.from(document.querySelectorAll(".reviews article")).map(
    (article) => ({
      rating: article.querySelectorAll(".rating .filled").length,
      author: {
        avatar: article.querySelector(".author img").getAttribute("src"),
        name: article.querySelector(".author span").textContent,
      },
      title: article.querySelector(".title").textContent,
      description:
        article.querySelector(".title").nextElementSibling.textContent,
      date: article.querySelector(".author i").textContent.split("/").join("."),
    })
  );
}

function parsePage() {
  const [price, oldPrice] = document
    .querySelector(".price")
    .innerText.replaceAll(/[₽$€]/g, "")
    .split(" ")
    .map(Number);
  const discount = oldPrice - price;
  const currency = getCurrencyTextBySymbol(
    document.querySelector(".price").innerText.match(/([₽$€])/)[1]
  );

  const formatterWithDecimals = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    meta: {
      title: document.title.split("—")[0].trim(),
      description: document
        .querySelector('meta[name="description"]')
        .getAttribute("content"),
      keywords: document
        .querySelector('meta[name="keywords"]')
        .getAttribute("content")
        .split(",")
        .map((item) => item.trim()),
      language: document.documentElement.getAttribute("lang"),
      opengraph: getOpengraph(),
    },
    product: {
      id: document.querySelector(".product").dataset.id,
      name: document.querySelector(".about .title").textContent,
      isLiked: document.querySelector(".like").classList.contains("active"),
      tags: {
        category: [document.querySelector(".tags .green").textContent],
        discount: [document.querySelector(".tags .red").textContent],
        label: [document.querySelector(".tags .blue").textContent],
      },
      price,
      oldPrice,
      discount,
      discountPercent: formatterWithDecimals.format(
        discount / (oldPrice / 100) / 100
      ),
      currency,
      properties: getProperties(),
      description: getDescription(),
      images: getImages(),
    },
    suggested: getAdditionalProducts(),
    reviews: getReviews(),
  };
}

window.parsePage = parsePage;
