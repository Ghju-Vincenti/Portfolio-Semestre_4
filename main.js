const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.hero .cta').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const options = prefersReducedMotion ? {} : { behavior: 'smooth' };
    document.querySelector('#projects').scrollIntoView(options);
  });
});

const downloadBtn = document.querySelector('.cta-header');
if (downloadBtn) {
  downloadBtn.addEventListener('click', e => {
    e.preventDefault();
    if (prefersReducedMotion) {
      window.location.href = downloadBtn.href;
      return;
    }
    const shouldDownload = confirm('Do you want to download my CV?');
    if (shouldDownload) {
      window.location.href = downloadBtn.href;
    }
  });
}

// main.js - Version DEBUG
import { createClient } from 'https://cdn.skypack.dev/@sanity/client'

// Configuration du client
const client = createClient({
  projectId: 'w1hfz6z1', 
  dataset: 'production',
  apiVersion: '2024-06-01',
  useCdn: true, // TOUJOURS true pour GitHub Pages
  perspective: 'published'
})

// Log de debug au début
console.log('🔧 DEBUG: Configuration Sanity:', {
  projectId: 'w1hfz6z1',
  dataset: 'production',
  useCdn: true,
  currentURL: window.location.href,
  protocol: window.location.protocol,
  hostname: window.location.hostname
})

// Test basique de connexion
console.log('🔍 Test 1: Vérification de la connexion Sanity...')

// Requête simple pour tester
const testQuery = `*[_type == "post"][0..2]{_id, title}`

client.fetch(testQuery)
  .then(result => {
    console.log('✅ Test 1 RÉUSSI: Connexion OK, données trouvées:', result)
    if (result.length === 0) {
      console.warn('⚠️ Aucun post trouvé. Vérifiez que vos posts sont bien publiés dans Sanity Studio')
    }
  })
  .catch(error => {
    console.error('❌ Test 1 ÉCHOUÉ: Erreur de connexion:', error)
    console.error('Type d\'erreur:', error.name)
    console.error('Message:', error.message)
    
    // Diagnostic spécifique
    if (error.message.includes('CORS')) {
      console.error('🚫 PROBLÈME CORS: Ajoutez votre domaine GitHub Pages dans Sanity Dashboard')
      console.error('👉 Allez sur: https://sanity.io/manage/personal/project/w1hfz6z1/api')
      console.error('👉 Ajoutez:', window.location.origin)
    }
  })

// Requête complète
const fullQuery = `*[_type == "post" && 
// Filter by Category (example: "Tech" category)
references(*[_type == "category" && title == $categoryTitle]._id) && 
// Filter by Tag (example: "JavaScript" tag)
references(*[_type == "tag" && title == $tagTitle]._id) && 
// Filter by Year (example: "2023")
year == $year
] | order(publishedAt desc) {
_id,
title,
"slug": slug.current,
"imageUrl": mainImage.asset->url,
publishedAt,
body,
"categories": categories[]->{title},
year,
"author": author->name,
"documents": documents[] {
  "asset": asset->{url, originalFilename}
}
}`


const postsGrid = document.querySelector('.posts')

// Vérification de l'élément DOM
if (!postsGrid) {
  console.error('❌ Élément .posts non trouvé dans le DOM!')
  console.log('📋 Éléments disponibles:', document.querySelectorAll('*[class]'))
}

// Fonction pour formater la date
function formatDate(dateString) {
  if (!dateString) return 'Date non disponible'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Version simplifiée pour le debug
function createSimplePostHTML(post) {
  return `
    <div style="border: 1px solid #ccc; padding: 15px; margin: 10px 0; border-radius: 5px;">
      <h3>${post.title || 'Titre manquant'}</h3>
      <p><strong>ID:</strong> ${post._id}</p>
      <p><strong>Année:</strong> ${(post.year)}</p>
      <p><strong>Auteur:</strong> ${post.author || 'Non défini'}</p>
      <p><strong>Catégories:</strong> ${post.categories?.length ? post.categories.map(cat => cat.title).join(', ') : 'Aucune'}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="max-width: 200px; height: auto;">` : '<p>Pas d\'image</p>'}
      <p><strong>Corps:</strong> ${post.body ? 'Contenu présent' : 'Pas de contenu'}</p>
      ${post.documents?.length ? `<p><strong>Fichiers:</strong> ${post.documents.length} fichier(s)</p>` : ''}
    </div>
  `
}

// Fonction principale de chargement
// Fonction pour charger les posts avec les filtres
function loadPosts() {
  const categoryFilter = document.querySelector('#category-filter').value;
  const authorFilter = document.querySelector('#author-filter').value;

  console.log('🔍 Test 2: Chargement des posts avec filtres...')

  // Affichage de loading
  if (postsGrid) {
    postsGrid.innerHTML = '<p>🔄 Chargement des posts...</p>'
  }

  // Construction de la requête avec les filtres
  let filterQuery = '*[_type == "post"]';
  
  if (categoryFilter) {
    filterQuery += ` && categories[]->title == "${categoryFilter}"`;
  }


  filterQuery += ' | order(publishedAt desc){_id, title, "slug": slug.current, "imageUrl": mainImage.asset->url, publishedAt, body, "categories": categories[]->{title}, "author": author->name, "documents": documents[]{ "asset": asset->{url, originalFilename}}}';

  client.fetch(filterQuery)
    .then(posts => {
      console.log('✅ Test 2 RÉUSSI: Posts récupérés:', posts);
      if (!postsGrid) {
        console.error('❌ Impossible d\'afficher: élément .posts manquant');
        return;
      }

      if (!posts || posts.length === 0) {
        postsGrid.innerHTML = `
          <div style="padding: 20px; background: #ffeeee; border: 1px solid #ff0000;">
            <h3>❌ Aucun post trouvé</h3>
            <p>Vérifiez que les filtres sont correctement appliqués.</p>
          </div>
        `;
        return;
      }

      // Affichage des posts
      postsGrid.innerHTML = ''; // Clear loading
      posts.forEach((post, index) => {
        console.log(`📝 Post ${index + 1}:`, post);
        const el = document.createElement('div');
        el.innerHTML = createSimplePostHTML(post);
        postsGrid.appendChild(el);
      });

      console.log('✅ Affichage terminé!');
    })
    .catch(err => {
      console.error('❌ Test 2 ÉCHOUÉ:', err);

      if (postsGrid) {
        postsGrid.innerHTML = `
          <div style="padding: 20px; background: #ffeeee; border: 1px solid #ff0000;">
            <h3>❌ Erreur de chargement</h3>
            <p><strong>Erreur:</strong> ${err.message}</p>
            <p>Consultez la console pour plus de détails</p>
          </div>
        `;
      }
    });
}

// Ajouter des événements pour surveiller les changements dans les filtres
document.querySelector('#category-filter').addEventListener('change', loadPosts);
document.querySelector('#author-filter').addEventListener('change', loadPosts);


// Tests de l'API directement
function testApiDirectly() {
  console.log('🔍 Test 3: Test direct de l\'API...')
  
  const apiUrl = `https://w1hfz6z1.api.sanity.io/v2024-06-01/data/query/production?query=*[_type == "post"]`
  
  fetch(apiUrl)
    .then(response => {
      console.log('📡 Réponse API Status:', response.status)
      console.log('📡 Réponse API Headers:', response.headers)
      return response.json()
    })
    .then(data => {
      console.log('✅ Test 3 RÉUSSI: Données API directes:', data)
    })
    .catch(error => {
      console.error('❌ Test 3 ÉCHOUÉ: API directe inaccessible:', error)
    })
}

// Lancement des tests
console.log('🚀 Début des tests de diagnostic...')
testApiDirectly()

// Attendre un peu avant de charger les posts
setTimeout(() => {
  loadPosts()
}, 1000)