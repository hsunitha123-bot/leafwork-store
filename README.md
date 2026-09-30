# Leafwork

A front-end houseplant store built with plain HTML, CSS and JavaScript. No frameworks, no build step, no installs.

## Features

- Product grid with category filters
- Shopping cart drawer that stays saved between pages
- Checkout form with field checks and order summary
- Contact page with a message form
- User accounts: sign up, log in, log out, order history
- Wishlist with heart buttons and a dedicated page
- Discount code box (try `WELCOME10`)
- Reviews and star ratings
- Dark and light mode toggle
- Admin panel: view orders, update order status, add or delete products, manage discount codes
- Responsive layout that works on phones

## Project structure

```
leafwork-store/
  index.html      Shop page
  checkout.html   Checkout form
  contact.html    Contact page
  login.html      Log in and create account
  account.html    Profile, wishlist, orders
  wishlist.html   Saved plants
  admin.html      Admin panel
  styles.css      Main styles
  features.css    Styles for accounts, reviews, theme toggle
  wishlist.css    Styles for the wishlist
  script.js       Products, cart, checkout and contact logic
  features.js     Accounts, admin, discounts, reviews, theme
  wishlist.js     Wishlist logic
```

## Run it locally

1. Download or clone this repository.

## Customize

- **Products and prices:** the `P` list at the top of `script.js`, or use the admin panel.
- **Colors:** the `:root` block at the top of `styles.css`.
- **Store details:** the contact information in `contact.html`.

## Demo admin account

Log in at `login.html` with the demo admin account, then open the Admin link in the menu. Change these details in `features.js` before sharing the project publicly.

## Important limitations

This is a front-end demo. All data (accounts, orders, reviews, wishlists) is saved in the visitor's own browser using `localStorage`. That means:

- Data is not shared between devices or visitors.
- Passwords and the admin check are not secure.
- Forms and checkout do not send anything or take real payments.

To run a real store, add a backend (for example Node.js with a database, or a service such as Supabase) and a payment provider.

## Roadmap

- Backend with a database and secure logins
- Real payments
- Order confirmation emails
- Product detail pages, search and sorting
- AI plant finder and chat assistant

## License

MIT. Free to use and modify.
