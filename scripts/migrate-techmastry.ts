import { PrismaClient, CourseCategory, CourseLevel } from '../lib/generated/prisma/client';

const prisma = new PrismaClient();

interface TechMastryChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  solution: string;
  hints: string[];
  timeLimit: number;
  price?: number;
}

const techMastryChallenges: TechMastryChallenge[] = [
  {
    id: 'string-reverse',
    title: 'Inverser une chaîne de caractères',
    description: 'Maîtrisez les manipulations de chaînes en JavaScript. Apprenez à inverser efficacement une chaîne de caractères avec différentes approches.',
    difficulty: 'easy',
    category: 'Manipulation de chaînes',
    tags: ['string', 'javascript', 'algorithms', 'beginner'],
    solution: `// Méthode 1: Avec les méthodes natives
function reverseString(str) {
  return str.split('').reverse().join('');
}

// Méthode 2: Avec une boucle for
function reverseStringLoop(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}

// Méthode 3: Récursive
function reverseStringRecursive(str) {
  if (str === '') return '';
  return reverseStringRecursive(str.substr(1)) + str.charAt(0);
}`,
    hints: [
      'Utilisez les méthodes split(), reverse() et join() pour une solution simple',
      'Pensez à convertir la chaîne en tableau pour manipuler les caractères',
      'Une boucle for peut aussi faire l\'affaire en parcourant de la fin vers le début',
      'Essayez une approche récursive pour un défi supplémentaire'
    ],
    timeLimit: 300,
    price: 0
  },
  {
    id: 'array-manipulation',
    title: 'Manipulation avancée de tableaux',
    description: 'Découvrez les techniques avancées de manipulation de tableaux en JavaScript. Filtrage, transformation, réduction et plus encore.',
    difficulty: 'medium',
    category: 'Structures de données',
    tags: ['array', 'javascript', 'functional-programming', 'intermediate'],
    solution: `// Filtrer les nombres pairs
const filterEven = arr => arr.filter(num => num % 2 === 0);

// Transformer et calculer
const doubleAndSum = arr => arr
  .map(num => num * 2)
  .reduce((sum, num) => sum + num, 0);

// Grouper par propriété
const groupBy = (arr, key) => 
  arr.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});`,
    hints: [
      'Utilisez filter() pour sélectionner des éléments selon un critère',
      'map() transforme chaque élément du tableau',
      'reduce() est puissant pour agréger des données',
      'Combinez plusieurs méthodes pour des opérations complexes'
    ],
    timeLimit: 600,
    price: 1999
  },
  {
    id: 'async-patterns',
    title: 'Patterns asynchrones modernes',
    description: 'Maîtrisez les patterns asynchrones en JavaScript : Promises, async/await, gestion d\'erreurs et patterns avancés.',
    difficulty: 'hard',
    category: 'JavaScript avancé',
    tags: ['async', 'promises', 'javascript', 'advanced', 'patterns'],
    solution: `// Pattern: Retry avec backoff exponentiel
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}

// Pattern: Parallel avec limite de concurrence
async function limitedParallel(tasks, limit = 3) {
  const results = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map(task => task())
    );
    results.push(...batchResults);
  }
  return results;
}`,
    hints: [
      'async/await simplifie la gestion des Promises',
      'Promise.all() pour l\'exécution parallèle',
      'try/catch pour gérer les erreurs async',
      'setTimeout avec Promise pour créer des délais'
    ],
    timeLimit: 900,
    price: 4999
  }
];

// Mapping des catégories vers les enums Prisma
const categoryMapping: Record<string, CourseCategory> = {
  'Manipulation de chaînes': 'JAVASCRIPT',
  'Structures de données': 'JAVASCRIPT',
  'JavaScript avancé': 'JAVASCRIPT',
  'Algorithmes': 'JAVASCRIPT',
  'Frontend': 'FRONTEND',
  'Backend': 'BACKEND',
  'TypeScript': 'TYPESCRIPT',
  'Cloud': 'CLOUD',
  'IA': 'AI',
  'DevOps': 'DEVOPS'
};

const difficultyMapping: Record<string, CourseLevel> = {
  'easy': 'BEGINNER',
  'medium': 'INTERMEDIATE',
  'hard': 'ADVANCED'
};

// Fonction utilitaire pour attribuer des couleurs aux tags
function getTagColor(tagName: string): string {
  const colorMap: Record<string, string> = {
    'javascript': '#F7DF1E',
    'typescript': '#3178C6',
    'string': '#10B981',
    'array': '#8B5CF6',
    'algorithms': '#EF4444',
    'async': '#F59E0B',
    'promises': '#06B6D4',
    'beginner': '#22C55E',
    'intermediate': '#F59E0B',
    'advanced': '#EF4444',
    'patterns': '#8B5CF6',
    'functional-programming': '#6366F1'
  };

  return colorMap[tagName] || '#6B7280';
}

async function migrateTechMastryToCourses() {
  try {
    console.log('🚀 Starting TechMastry to Courses migration...');

    // Créer une catégorie "Interview Prep" si elle n'existe pas
    const interviewPrepTag = await prisma.tag.upsert({
      where: { name: 'interview-prep' },
      update: {},
      create: { 
        name: 'interview-prep',
        color: '#8B5CF6'
      }
    });

    let migratedCount = 0;

    for (const challenge of techMastryChallenges) {
      try {
        // Vérifier si le cours existe déjà
        const existingCourse = await prisma.course.findUnique({
          where: { slug: challenge.id }
        });

        if (existingCourse) {
          console.log(`⏭️  Course already exists: ${challenge.title}`);
          continue;
        }

        // Créer le cours
        const course = await prisma.course.create({
          data: {
            title: challenge.title,
            slug: challenge.id,
            description: challenge.description,
            category: categoryMapping[challenge.category] || 'JAVASCRIPT',
            level: difficultyMapping[challenge.difficulty],
            published: true,
            featured: challenge.difficulty === 'hard',
            duration: Math.ceil(challenge.timeLimit / 60),
            price: challenge.price || 0,
          }
        });

        // Créer la leçon principale
        await prisma.lesson.create({
          data: {
            title: `Défi : ${challenge.title}`,
            slug: 'challenge',
            description: challenge.description,
            content: `# ${challenge.title}

## 📝 Description du défi

${challenge.description}

## ⏱️ Temps alloué
${Math.ceil(challenge.timeLimit / 60)} minutes

## 💡 Indices

${challenge.hints.map((hint, index) => `${index + 1}. ${hint}`).join('\n')}

## ✅ Solution

\`\`\`javascript
${challenge.solution}
\`\`\`

## 🎯 Points clés à retenir

- Analysez le problème avant de coder
- Pensez aux cas limites
- Optimisez votre solution si possible
- Testez avec différents exemples

## 🚀 Pour aller plus loin

Essayez d'implémenter d'autres variantes de cette solution ou d'optimiser les performances.`,
            duration: challenge.timeLimit,
            order: 1,
            published: true,
            courseId: course.id,
          }
        });

        // Créer et lier les tags
        const tagPromises = challenge.tags.map(async (tagName) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { 
              name: tagName,
              color: getTagColor(tagName)
            }
          });

          // Créer la liaison course-tag
          await prisma.courseTag.upsert({
            where: {
              courseId_tagId: {
                courseId: course.id,
                tagId: tag.id,
              }
            },
            update: {},
            create: {
              courseId: course.id,
              tagId: tag.id,
            }
          });

          return tag;
        });

        await Promise.all(tagPromises);

        // Ajouter le tag "interview-prep" à tous les cours
        await prisma.courseTag.upsert({
          where: {
            courseId_tagId: {
              courseId: course.id,
              tagId: interviewPrepTag.id,
            }
          },
          update: {},
          create: {
            courseId: course.id,
            tagId: interviewPrepTag.id,
          }
        });

        migratedCount++;
        console.log(`✅ Migrated challenge: ${challenge.title} (${challenge.difficulty})`);

      } catch (error) {
        console.error(`❌ Failed to migrate challenge: ${challenge.title}`, error);
      }
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Migrated ${migratedCount} challenges out of ${techMastryChallenges.length}`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateTechMastryToCourses();
}

export { migrateTechMastryToCourses };
