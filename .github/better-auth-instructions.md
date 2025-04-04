- **Contexte** : Implémentez une authentification sécurisée avec sessions JWT
- **Patterns** :
  1. Créez toujours des wrappers `withAuth` pour les routes protégées
  2. Utilisez des cookies HTTPOnly pour le stockage des tokens
  3. Validez les tokens côté serveur avec Zod
- **Exemple** :
  "Crée un middleware Better-Auth qui vérifie le rôle utilisateur et log les tentatives échouées"
