# Sahti — Frontend de démonstration

Application Next.js/Tailwind avec données simulées, conçue pour valider les parcours patient, cabinet et administration avant la connexion à Supabase.

## Démarrer dans Visual Studio Code

1. Installez [Node.js LTS](https://nodejs.org/) puis ouvrez ce dossier dans VS Code.
2. Ouvrez le terminal intégré (`Ctrl` + `` ` ``) et lancez `npm install`.
3. Lancez `npm run dev`.
4. Ouvrez [http://localhost:3000](http://localhost:3000).

Sous PowerShell, si `npm` est bloqué par la politique de scripts, utilisez `npm.cmd run dev`.

## Pages de démonstration

- `/` : recherche et demande de rendez-vous patient
- `/cabinets/sourire` : fiche cabinet
- `/confirmation?cabinet=sourire` : confirmation mockée
- `/historique` : historique patient
- `/auth` : connexion/inscription SMS simulée
- `/login` : accès professionnel simulé
- `/cabinet` : tableau de bord cabinet
- `/admin` : tableau de bord administrateur

Les données se trouvent dans `lib/mock-data.ts`. Les futures requêtes Supabase peuvent remplacer ce fichier progressivement.
