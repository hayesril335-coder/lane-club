export const defaultProducts = [
  { id: 'shoe-rental', title: 'Bowling Shoe Rental', description: 'A fresh pair of house bowling shoes in your selected size.', price: 5, image: '' },
  { id: 'snack-combo', title: 'Lane Snack Combo', description: 'Shareable fries, soft pretzel bites, and two fountain drinks.', price: 18, image: '' },
  { id: 'pro-shop-ball', title: 'Entry Bowling Ball', description: 'A dependable starter ball with basic fitting included.', price: 89, image: '' },
]

export function productsForAlley(alley) {
  return Array.isArray(alley?.products) && alley.products.length ? alley.products : defaultProducts
}
