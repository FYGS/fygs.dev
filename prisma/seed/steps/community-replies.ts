import {
  type Discussion,
  type DiscussionReply,
  type PrismaClient,
  type User,
} from "@prisma/client";
import { randomBetween } from "../utils";

/** Discussion replies. */
export async function seedCommunityReplies(
  prisma: PrismaClient,
  { users, discussions }: { users: User[]; discussions: Discussion[] },
): Promise<{ replies: DiscussionReply[] }> {
  // Create discussion replies
  const replyTemplates = [
    {
      discussionIndex: 1, // React performance question
      authorIndex: 1, // Expert user
      content: `Excellente question ! Voici plusieurs techniques pour optimiser tes composants React :

## 1. React.memo pour éviter les re-renders inutiles

\`\`\`jsx
const ItemCard = React.memo(({ item, onClick }) => {
  return <div onClick={onClick}>{item.name}</div>;
});
\`\`\`

## 2. useCallback pour stabiliser les fonctions

\`\`\`jsx
function MyComponent({ items, onSelect }) {
  const handleSelect = useCallback((item) => {
    onSelect(item);
  }, [onSelect]);

  return (
    <div>
      {items.map(item => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={() => handleSelect(item)}
        />
      ))}
    </div>
  );
}
\`\`\`

## 3. useMemo pour les calculs coûteux

Si tu as des transformations de données coûteuses, utilise \`useMemo\` !

Tu peux aussi regarder les React DevTools Profiler pour identifier les composants problématiques. 🔍`,
      isAccepted: true,
    },
    {
      discussionIndex: 1,
      authorIndex: 8,
      content: `+1 pour les conseils de @${users[1].name} ! 

J'ajouterais aussi de faire attention aux props qui changent à chaque render. Par exemple :

❌ **À éviter :**
\`\`\`jsx
<Component style={{ margin: 10 }} />
\`\`\`

✅ **Mieux :**
\`\`\`jsx
const styles = { margin: 10 };
<Component style={styles} />
\`\`\`

La règle d'or : toujours penser à la référence des objets ! 👍`,
    },
    {
      discussionIndex: 2, // Portfolio feedback
      authorIndex: 2,
      content: `Super portfolio ! 🎉 Voici mes retours :

## ✅ Points forts
- Design moderne et épuré
- Animations fluides avec Framer Motion
- Code bien structuré sur GitHub
- Performance excellente (99/100 sur Lighthouse)

## 💡 Suggestions d'amélioration
1. **Accessibilité** : Ajouter plus de labels ARIA
2. **SEO** : Optimiser les meta descriptions
3. **Contact** : Ajouter un formulaire de contact
4. **Blog** : Section blog pour montrer tes connaissances

## 🚀 Recommandations pour décrocher un job
Avec ce niveau, tu peux viser des postes junior/mid-level ! N'hésite pas à postuler. 

Bravo pour le travail ! 👏`,
    },
    {
      discussionIndex: 3, // Next.js 15 TypeScript
      authorIndex: 0, // Instructor
      content: `Salut ! C'est effectivement un changement important dans Next.js 15. 

## Solution

Depuis Next.js 15, les \`params\` et \`searchParams\` sont des Promises. Voici comment adapter ton code :

\`\`\`tsx
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <div>Post ID: {id}</div>
}
\`\`\`

## Pourquoi ce changement ?

Cela permet une meilleure optimisation des performances et prépare Next.js pour les futures fonctionnalités de streaming.

## Pour generateMetadata aussi

\`\`\`tsx
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: \`Post \${id}\` };
}
\`\`\`

J'ai prévu de faire une vidéo sur ce sujet dans la formation Next.js ! 📹`,
      isModerator: true,
    },
    {
      discussionIndex: 4, // Career advice
      authorIndex: 9,
      content: `Salut ! Moi aussi je suis en reconversion (ancien comptable) et j'ai décroché mon premier poste il y a 6 mois. Voici mes conseils :

## 🎯 Type de poste à viser
- **Stage de fin d'études** (même en reconversion)
- **Poste junior avec formation** 
- **Missions courtes en freelance** pour se faire la main

## 💪 Valoriser ton profil atypique
- Met en avant tes **soft skills** du marketing
- Montre ta **capacité d'apprentissage**
- Parle de tes **projets concrets**

## 📚 Compétences demandées actuellement
1. React/Next.js (tu es bon là-dessus !)
2. TypeScript
3. Tests (Jest/Testing Library)
4. Git en équipe
5. Méthodes agiles

## 🎤 Entretiens techniques
- **Prépare des exercices** sur CodeWars/LeetCode
- **Explique ton code** à voix haute
- **Pose des questions** sur leur stack technique

Tu as déjà un bon profil, continue ! 🚀`,
    },
    {
      discussionIndex: 5, // JavaScript closures
      authorIndex: 1,
      content: `Les closures sont super utiles ! Voici des cas concrets :

## 🏭 Factory pattern
\`\`\`javascript
function createValidator(rules) {
  return function(data) {
    return rules.every(rule => rule(data));
  };
}

const emailValidator = createValidator([
  data => data.includes('@'),
  data => data.length > 5
]);
\`\`\`

## 🔒 Variables privées (avant les classes)
\`\`\`javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;
  
  return {
    deposit: (amount) => balance += amount,
    withdraw: (amount) => balance -= amount,
    getBalance: () => balance
  };
}
\`\`\`

## ⚡ Throttle/Debounce
\`\`\`javascript
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
\`\`\`

Les closures permettent de créer des "environnements persistants" ! 🧠`,
    },
  ];

  const replies = [];
  for (const template of replyTemplates) {
    const reply = await prisma.discussionReply.create({
      data: {
        content: template.content,
        authorId: users[template.authorIndex].id,
        discussionId: discussions[template.discussionIndex].id,
        isAccepted: template.isAccepted || false,
        isModerator: template.isModerator || false,
        upvoteCount: randomBetween(0, 25),
        downvoteCount: randomBetween(0, 3),
      },
    });
    replies.push(reply);
  }
  console.log(`✅ Created ${replies.length} discussion replies`);

  return { replies };
}
