# AI-CDSS Transparency Assessment Tool

A web-based tool that helps Nigerian healthcare institutions check the transparency of an
AI-assisted clinical decision support system (AI-CDSS), before adoption and while in use.

Built with HTML, CSS and JavaScript, with Supabase as the backend and Vercel for hosting.
No patient data is collected.

## Files

| File / folder | What it is |
|---|---|
| `index.html` | Homepage |
| `login.html` | Log in and create account |
| `dashboard.html` | My assessments |
| `new-assessment.html` | Enter AI-CDSS details and stage |
| `assessment.html` | The questions (assessment engine) |
| `report.html` | The report (report generator) |
| `css/styles.css` | All styling (teal and deep blue branding) |
| `js/config.js` | **Where you paste your Supabase keys** |
| `js/common.js` | Shared code: icons, login, saving data |
| `js/*.js` | Code for each page |
| `data/questions.json` | The question bank (questions, guidance, sources) |
| `supabase/setup.sql` | Creates the database tables and Row Level Security |

## Try it straight away (demo mode)

Until you add Supabase keys, the tool runs in **demo mode**: everything works, but data is
saved only in your browser.

The pages load the question bank with `fetch`, so open them through a local web server,
not by double-clicking the file:

- **VS Code:** install the "Live Server" extension, right-click `index.html` > "Open with Live Server".
- **Or with Python:** open a terminal in this folder and run `python -m http.server 8000`,
  then visit http://localhost:8000

## Step 1: Set up Supabase

1. Go to https://supabase.com and create a free account.
2. Click **New project**. Give it a name (e.g. `aicdss-tool`), set a database password
   (save it somewhere), choose the region closest to Nigeria (e.g. *West EU* or
   *Central EU*), and click **Create**. Wait a minute while it sets up.
3. In the left menu open **SQL Editor** > **New query**. Open `supabase/setup.sql`, copy
   everything, paste it in, and click **Run**. You should see "Success".
4. Open **Authentication** > **Sign In / Providers** > **Email**.
   - For testing and your demo, you can turn **off** "Confirm email" so new users can
     log in immediately.
   - If you leave it **on**, new users must click the link in their email before logging in.
5. Open **Project Settings** > **API** (or **Data API**). Copy the **Project URL** and the
   **anon public** key.
6. Open `js/config.js` and replace the two placeholders with these values. Save the file.

Reload the tool: the yellow "Demo mode" message disappears, and accounts and assessments
are now saved in Supabase. You can see them under **Table Editor** > `assessments` and `answers`.

## Step 2: Put it online with Vercel

1. Create a free account at https://github.com and a new repository (e.g. `aicdss-tool`).
2. Upload all the files in this folder to the repository (Add file > Upload files),
   keeping the folder structure.
3. Go to https://vercel.com, sign in with GitHub, click **Add New** > **Project**, and
   import the repository.
4. Framework preset: **Other**. Leave the build settings empty. Click **Deploy**.
5. Vercel gives you a web address like `https://aicdss-tool.vercel.app`.
6. Back in Supabase, open **Authentication** > **URL Configuration** and set the
   **Site URL** to your Vercel address (needed for email confirmation links).

Every time you upload changes to GitHub, Vercel updates the site automatically.

## Updating the questions

Edit `data/questions.json`. Each question has an `id`, the `question`, the `guidance`
shown when it is a governance gap, and its `source`. Keep the ids (TR1, TR2, …) unchanged
for questions that already have saved answers.
