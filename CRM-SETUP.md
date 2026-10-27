# Jackson Bros CRM: setup (about 15 minutes, free)

## What's in v3

- **index.html**: the booking form now sends each request to two places: the CRM (Firebase) and Netlify Forms as a backup. The customer then lands on **thank-you.html**.
- **crm/**: the CRM itself, at `https://YOUR-SITE.netlify.app/crm/`. It needs a sign-in. It has four tabs: Leads, Calendar, Clients and Revenue (see below).
- **assets/firebase-config.js**: where your Firebase keys go (step 2).
- **firestore.rules**: the security rules (step 3).

The site and the form still work before you set up Firebase. Leads only go to Netlify Forms until Firebase is connected.

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com → **Add project**, and name it something like `led-detailing`. Google Analytics isn't needed.
2. On the project home page, click the **</>** (Web) icon to add a web app. Name it `Jackson Bros site`. Don't check Firebase Hosting.
3. Copy the `firebaseConfig` values it shows you.

The free **Spark** plan is enough for this. You don't need a card or the Blaze plan.

## 2. Paste the keys
Open `assets/firebase-config.js` and replace each `PASTE_...` value with the matching value from step 1.3. These keys are meant to be public. The rules in step 3 are what protect your data.

## 3. Turn on the database
1. Go to **Build → Firestore Database → Create database**. Pick location `nam5 (United States)` and start in **production mode**.
2. Open the **Rules** tab, delete what's there, paste the whole `firestore.rules` file, and click **Publish**.
3. Only the email listed in the rules can open the CRM. It's set to `brosjackson75@gmail.com`. To give someone else access, add their email to that list in lowercase, for example `'brosjackson75@gmail.com', 'someone@gmail.com'`, then publish again.

## 4. Create the login
1. Go to **Build → Authentication → Get started → Email/Password**, then **Enable** and **Save**.
2. On the **Users** tab, click **Add user** and enter the same email as in the rules, plus a password.
3. On the **Settings** tab, open **User actions** and uncheck **Enable create (sign-up)**. This stops strangers from making their own accounts.

## 5. Deploy and test
1. Deploy this folder to Netlify the same way you deployed v2: drag it in, or push it to the repo.
2. On the **live** site (not the copy on your computer), submit a test booking. You should land on the thank-you page.
3. Open `/crm/` on the live site and sign in. The test lead should be there. Change its status, add a note, then delete it.

## Using it
- **Status flow:** New → Contacted → Booked → Completed, or Lost. The tab counts and the browser tab title show how many are New.
- **Notes** save when you click out of the box.
- **+ Add lead** is for calls, Instagram DMs, and walk-ups.
- You can bookmark `/crm/` on your phone or add it to the home screen. The page updates live, so new requests show up without refreshing.

## Calendar, Clients and Revenue (added in v3.1)
The CRM has four tabs at the top: **Leads, Calendar, Clients, Revenue**. They all use the same leads, so there's nothing new to set up in Firebase and you don't need to republish the rules.

- **Booking a job:** set a lead to **Booked**. Appointment date, time, price and tip boxes appear on the card. If the customer picked a date on the form, it's filled in for you.
- **Finishing a job:** set it to **Completed**. If you didn't type a price, the package price is used (marked "est." on the Revenue tab), so type what you actually charged when it's different. Tips go in the Tip box.
- **Calendar:** month view of booked jobs (green), finished jobs (gray) and dates customers asked for but aren't booked yet (dashed pink). Tap a day to see its jobs, with buttons for Call, Text, Directions and Add to Google Calendar. **+ Book this day** adds a job straight onto that date.
- **Clients:** everyone who has booked, grouped by phone number, so repeat customers show up once with their full history and total spent. **+ New job** re-books them with their info already filled in. **Download client list (CSV)** gives you a spreadsheet of the list.
- **Revenue:** totals for this month, last month, this year, last year or all time, a month-by-month chart, revenue by package, what's booked ahead, and every completed job. **Download CSV** exports the jobs for bookkeeping or taxes.
- **Edit** on any card (or tapping a job anywhere) opens the full details, including name, phone and package.
- **Adding past jobs:** use **+ Add lead**, set the status to Completed, and fill in the date and price. That gets old customers into Clients and Revenue.

## If something's off
- **"This login isn't allowed to see leads"**: the email you signed in with isn't in `firestore.rules`. Add it and publish.
- **The form goes to the thank-you page but nothing shows in the CRM**: the Firebase keys in `assets/firebase-config.js` are missing or wrong, or the rules weren't published. Open the browser console (F12) on the live site and look for a `[booking form]` message. The lead is still saved in Netlify → Forms.
- **Testing from the copy on your computer:** Netlify Forms only works on the live site. The CRM copy still saves if Firebase is set up.
