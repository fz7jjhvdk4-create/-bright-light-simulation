# Bright Light Solutions - Kvalitetssimulering

En interaktiv företagssimulering där studenter agerar som konsulter och löser ett kvalitetsproblem genom att intervjua medarbetare.

## Deploy till Vercel (Steg-för-steg)

### 1. Skapa GitHub-repo

1. Gå till [github.com](https://github.com) och logga in
2. Klicka på **"+"** → **"New repository"**
3. Namn: `bright-light-simulation` (eller valfritt)
4. Välj **Private** (rekommenderas)
5. Klicka **"Create repository"**

### 2. Ladda upp koden till GitHub

Öppna Terminal och kör:

```bash
cd "/Users/claeshansen/Documents/Kod simulering/bright-light-sim"

# Initiera git
git init

# Lägg till alla filer
git add .

# Skapa första commit
git commit -m "Initial commit - Bright Light Simulation"

# Koppla till ditt GitHub-repo (byt ut USERNAME mot ditt användarnamn)
git remote add origin https://github.com/USERNAME/bright-light-simulation.git

# Ladda upp
git branch -M main
git push -u origin main
```

### 3. Deploy på Vercel

1. Gå till [vercel.com](https://vercel.com) och logga in med GitHub
2. Klicka **"Add New..."** → **"Project"**
3. Välj ditt `bright-light-simulation` repo
4. **VIKTIGT:** Innan du klickar Deploy, lägg till miljövariabel:
   - Klicka på **"Environment Variables"**
   - Name: `ANTHROPIC_API_KEY`
   - Value: `din-api-nyckel-här`
   - Klicka **"Add"**
5. Klicka **"Deploy"**

### 4. Klart!

Efter 1-2 minuter får du en URL som t.ex:
`https://bright-light-simulation.vercel.app`

Dela denna URL med dina studenter!

---

## Lokal utveckling (valfritt)

Om du vill testa lokalt först:

```bash
cd "/Users/claeshansen/Documents/Kod simulering/bright-light-sim"

# Installera dependencies
npm install

# Skapa .env.local med din API-nyckel
echo "ANTHROPIC_API_KEY=din-nyckel-här" > .env.local

# Starta utvecklingsserver
npm run dev
```

Öppna http://localhost:3000

---

## Säkerhet

- API-nyckeln lagras säkert som miljövariabel i Vercel
- Den är ALDRIG synlig i koden eller för studenter
- `.env.local` är i `.gitignore` och laddas aldrig upp

---

## Kostnad

- Vercel: Gratis (hobby plan)
- Claude API: ~$0.01-0.03 per studentkonversation (Sonnet-modellen)
- 100 studenter × 5 konversationer ≈ $5-15

---

## Anpassa

Vill du ändra simuleringen? Redigera `app/api/chat/route.ts` och uppdatera `SYSTEM_PROMPT`.
