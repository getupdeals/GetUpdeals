getupdeals

Never pay full price for what gets you out of bed.

GetUpDeals is a deal aggregation platform that curates the best daily discounts, promo codes, and limited-time offers across e-commerce, travel, food, and lifestyle categories.

---

✨ Features

· Live Deal Crawling – Real-time aggregation from 50+ partner stores
· Smart Filtering – Sort by discount %, expiry, popularity, or category
· Deal Alerts – Get notified when your wishlist items drop in price
· Expiry Timer – Never miss a flash sale with countdown indicators
· Upvote System – Community-driven validation (best deals rise to top)
· Dark Mode – Because early morning deal hunting needs dark UI

---

🚀 Tech Stack

Area Technologies
Frontend Next.js (App Router), Tailwind CSS, Shadcn/ui
Backend Node.js + Express, GraphQL (Apollo)
Database PostgreSQL + Prisma ORM
Scraping Puppeteer, Cheerio, custom rate‑limiter
Real‑time WebSockets (Socket.io) for live deal updates
Deployment Vercel (frontend), Railway (backend), Upstash (Redis)

---

📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/getupdeals.git
cd getupdeals

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open http://localhost:3000 to view it in the browser.

---

🗂️ Project Structure

```
getupdeals/
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utilities, API clients, constants
│   ├── graphql/          # GraphQL schema & resolvers
│   ├── scrapers/         # Store‑specific deal crawlers
│   └── hooks/            # Custom React hooks
├── prisma/               # Database schema & migrations
├── scripts/              # Cron jobs & data seeding
└── package.json
```

---

🕸️ Deal Scrapers

GetUpDeals currently aggregates deals from:

· Amazon, Best Buy, Walmart (electronics)
· Booking.com, Expedia, Skyscanner (travel)
· Uber Eats, DoorDash, Starbucks (food & coffee)
· Nike, Adidas, REI (apparel & outdoors)

Scrapers run every 15–30 minutes using a distributed queue system with automatic retry and polite crawling delays.

---

🎨 Customization

Add a New Store

1. Create a new scraper in src/scrapers/your-store.js
2. Implement fetchDeals() and parseHTML()
3. Register it in src/scrapers/index.js
4. Add store metadata to lib/constants/stores.js

Modify Deal Card UI

Edit src/components/DealCard.tsx. The component accepts:

· title, description, price, originalPrice
· discount, expiresAt, store, image
· upvotes, onUpvote

---

🧪 Testing

```bash
# Run unit tests
npm run test

# Run scraper tests
npm run test:scrapers

# End-to-end with Cypress
npm run cypress:open
```

---

🌍 Deployment

Frontend – Automatically deployed to Vercel on push to main

Backend – Deployed to Railway with PostgreSQL and Redis instances

Scrapers – Scheduled via GitHub Actions (.github/workflows/scrape.yml)

---

🤝 Contributing

We ❤️ contributions that help people wake up to better deals!

1. Fork the repository
2. Create a feature branch (git checkout -b feat/amazing-idea)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feat/amazing-idea)
5. Open a Pull Request

Please read CONTRIBUTING.md before starting.

---

📄 License

Distributed under the MIT License. See LICENSE for more information.

---

🙋‍♀️ FAQ

Q: Is this affiliated with any of the listed stores?
A: No. GetUpDeals is an independent aggregator. All product names, logos, and brands are property of their respective owners.

Q: How often are deals updated?
A: Most stores refresh every 15 minutes. Flash sales update in near real‑time via WebSocket.

Q: Can I request a new store?
A: Absolutely – open an issue with the store-request label.

---

☕ Support

If GetUpDeals saves you money, consider buying us a coffee:

https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png

---

<p align="center">Made with ☕ for early risers & smart shoppers</p>
```
