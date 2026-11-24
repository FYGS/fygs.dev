import {
  type Discussion,
  type PrismaClient,
  type Topic,
  type User,
} from "../../../lib/generated/prisma/client";
import { randomDate, randomBetween } from "../utils";

/** Community discussions. */
export async function seedCommunityDiscussions(
  prisma: PrismaClient,
  { users, topics, courses }: { users: User[]; topics: Topic[]; courses: any[] },
): Promise<{ discussions: Discussion[] }> {
  // Create community discussions
  const discussionTemplates = [
    {
      title: "Bienvenue dans la communauté FYGS Academy !",
      content: `# Bienvenue ! 👋

Nous sommes ravis de vous accueillir dans la communauté FYGS Academy !

## Comment utiliser ce forum ?

- **Posez vos questions** dans la section appropriée
- **Partagez vos projets** pour recevoir des retours
- **Aidez les autres** en répondant aux questions
- **Suivez les bonnes pratiques** de communication

## Règles de la communauté

1. Soyez respectueux et bienveillant
2. Utilisez un titre descriptif pour vos posts
3. Incluez le code et les détails pertinents
4. Recherchez avant de poster une nouvelle question

Bonne découverte ! 🚀`,
      topicIndex: 0,
      authorIndex: 0,
      isPinned: true,
      tags: ["bienvenue", "règles", "guide"],
    },
    {
      title: "Comment optimiser les performances de mes composants React ?",
      content: `Bonjour la communauté !

J'ai une application React qui commence à avoir des problèmes de performance. Mes composants se re-rendent trop souvent et l'interface devient lente.

## Mon problème

\`\`\`jsx
function MyComponent({ items, onSelect }) {
  return (
    <div>
      {items.map(item => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
\`\`\`

Avez-vous des conseils pour optimiser cela ? J'ai entendu parler de \`useMemo\` et \`useCallback\` mais je ne sais pas comment les utiliser efficacement.

Merci d'avance ! 🙏`,
      topicIndex: 2,
      authorIndex: 3,
      tags: ["react", "performance", "optimisation"],
    },
    {
      title: "Projet Portfolio - Demande de feedback",
      content: `Salut tout le monde !

Je viens de terminer mon portfolio en Next.js et j'aimerais avoir vos retours ! 

🔗 **Lien** : https://mon-portfolio.vercel.app
💻 **Code** : https://github.com/user/portfolio

## Technologies utilisées

- Next.js 15 avec App Router
- TypeScript
- Tailwind CSS
- Framer Motion pour les animations
- Prisma + PostgreSQL

## Points sur lesquels j'aimerais des retours

1. Design général et UX
2. Performance et optimisations
3. Code quality
4. Accessibilité

Merci pour votre temps ! 🚀`,
      topicIndex: 5,
      authorIndex: 4,
      tags: ["portfolio", "nextjs", "feedback"],
    },
    {
      title: "Erreur TypeScript avec Next.js 15 - Params Promise",
      content: `Bonjour !

Depuis la migration vers Next.js 15, j'ai des erreurs TypeScript avec les params des pages dynamiques.

## Erreur

\`\`\`
Type '{ id: string }' is missing the following properties from type 'Promise<any>': then, catch, finally
\`\`\`

## Code actuel

\`\`\`tsx
export default function Page({ params }: { params: { id: string } }) {
  return <div>Post ID: {params.id}</div>
}
\`\`\`

Comment je dois adapter mon code pour Next.js 15 ? J'ai lu quelque chose sur les params qui deviennent des Promises mais je ne comprends pas bien.

Merci ! 🤔`,
      topicIndex: 3,
      authorIndex: 5,
      tags: ["nextjs", "typescript", "migration"],
    },
    {
      title: "Conseils pour décrocher un premier job de développeur React ?",
      content: `Salut la communauté !

Je suis en reconversion et je termine bientôt la formation React Advanced Patterns. J'aimerais avoir vos conseils pour décrocher mon premier poste de développeur React.

## Mon profil

- 6 mois de formation intensive
- Plusieurs projets personnels (portfolio, e-commerce, blog)
- Ancien background en marketing
- Très motivé ! 💪

## Mes questions

1. Quel type de poste viser en premier ? (junior, stage, freelance ?)
2. Comment valoriser mon profil atypique ?
3. Quelles sont les compétences les plus demandées actuellement ?
4. Des conseils pour les entretiens techniques ?

Merci pour vos témoignages et conseils ! 🙏`,
      topicIndex: 6,
      authorIndex: 6,
      tags: ["career", "junior", "reconversion"],
    },
    {
      title: "Comprendre les closures en JavaScript",
      content: `Bonjour !

Je galère un peu avec le concept des closures en JavaScript. J'ai lu plusieurs articles mais j'ai du mal à saisir l'utilité pratique.

## Ce que je comprends

\`\`\`javascript
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  }
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

## Mes questions

1. Dans quels cas concrets utilise-t-on les closures ?
2. Y a-t-il des pièges à éviter ?
3. Lien avec les modules et l'encapsulation ?

Merci pour vos explications ! 🤓`,
      topicIndex: 1,
      authorIndex: 7,
      tags: ["javascript", "closures", "concepts"],
    },
  ];

  const discussions = [];
  for (let i = 0; i < discussionTemplates.length; i++) {
    const template = discussionTemplates[i];
    const discussion = await prisma.discussion.create({
      data: {
        title: template.title,
        slug: template.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        content: template.content,
        authorId: users[template.authorIndex].id,
        topicId: topics[template.topicIndex].id,
        courseId:
          template.topicIndex > 0 && template.topicIndex < 4
            ? courses[template.topicIndex - 1]?.id
            : null,
        isPinned: template.isPinned || false,
        tags: template.tags,
        viewCount: randomBetween(50, 500),
        lastActivityAt: randomDate(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          new Date()
        ),
      },
    });
    discussions.push(discussion);
  }
  console.log(`✅ Created ${discussions.length} community discussions`);

  return { discussions };
}
