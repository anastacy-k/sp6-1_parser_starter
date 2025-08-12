/**
 * 
 * @param {string} content
 */
function opengraphContentProcessing(content) {
    return content.split('—')[0].trim()
}

function getOpengraph() {
    return Object.fromEntries(
        Array
        .from(document.querySelectorAll('meta[property]'))
        .map((item) => [
            item.getAttribute('property').split(':')[1],
            opengraphContentProcessing(item.getAttribute('content')),
        ]),
    )
}

function getCurrencyTextBySymbol(s) {
    switch (s) {
        case '₽':
            return 'RUB'
        case '$':
            return 'USD'
        case '€':
            return 'EUR'
        default:
            return ''
    }
}

function parsePage() {
    const [price, oldPrice] = document.querySelector('.price').innerText
        .replaceAll(/[₽$€]/g, '')
        .split(' ')
        .map(Number)
    const discount = oldPrice - price
    const currency = getCurrencyTextBySymbol(
        document.querySelector('.price').innerText.match(/([₽$€])/)[1],
    )

    const formatterWithDecimals = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return {
        meta: {
            title: document.title.split('—')[0].trim(),
            description: document
                .querySelector('meta[name="description"]')
                .getAttribute('content'),
            keywords: document
                .querySelector('meta[name="keywords"]')
                .getAttribute('content')
                .split(',')
                .map((item) => item.trim()),
            language: document.documentElement.getAttribute('lang'),
            opengraph: getOpengraph(),
        },
        product: {
            id: document.querySelector('.product').dataset.id,
            name: document.querySelector('.about .title').textContent,
            isLiked: document.querySelector('.like').classList.contains('active'),
            tags: {
                category: [
                    document.querySelector('.tags .green').textContent
                ],
                discount: [
                    document.querySelector('.tags .red').textContent
                ],
                label: [
                    document.querySelector('.tags .blue').textContent
                ]
            },
            price,
            oldPrice,
            discount,
            discountPercent: formatterWithDecimals.format(discount / (oldPrice / 100) / 100),
            currency,
            
        },
        suggested: [],
        reviews: []
    };
}

window.parsePage = parsePage;