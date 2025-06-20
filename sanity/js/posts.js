// main.js
import { createClient } from 'https://cdn.skypack.dev/@sanity/client'

const client = createClient({
  projectId: 'w1hfz6z1', 
  dataset: 'production',
  apiVersion: '2024-06-01',
  useCdn: false // Important pour le développement local
})

const query = `*[_type == "post"]{
  title,
  "slug": slug.current,
  "imageUrl": mainImage.asset->url,
  publishedAt,
  "author": author->name,
  "documents": documents[]{
    "asset": asset->{url, originalFilename}
  }
}`

const postsGrid = document.querySelector('.posts')

// Fonction pour formater la date
function formatDate(dateString) {
  if (!dateString) return 'Date non disponible'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Fonction pour créer le HTML d'un post
function createPostHTML(post) {
  return `
    <h2>${post.title || 'Titre non disponible'}</h2>
    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="max-width: 100%; height: auto;">` : ''}
    <p><strong>Auteur :</strong> ${post.author || 'Inconnu'}</p>
    <p><strong>Publié le :</strong> ${formatDate(post.publishedAt)}</p>
    <p><strong>Catégories :</strong> ${post.categories?.length ? post.categories.map(cat => cat.title).join(', ') : 'Aucune'}</p>
    <p><strong>Résumé :</strong> ${post.body || 'Aucun résumé disponible.'}</p>
    ${post.documents?.length ? `
      <div>
        <p><strong>Fichiers :</strong></p>
        <ul>
          ${post.documents.map(doc => 
            `<li><a href="${doc.asset?.url}" class="cta" target="_blank" rel="noopener">${doc.asset?.originalFilename || 'Fichier'}</a></li>`
          ).join('')}
        </ul>
      </div>` : ''
    }
  `
}

// Affichage des posts
client.fetch(query)
  .then(posts => {
    console.log('Posts récupérés:', posts) // Pour débugger
    
    if (!posts || posts.length === 0) {
      postsGrid.innerHTML = '<p>Aucun post trouvé.</p>'
      return
    }

    posts.forEach(post => {
      const el = document.createElement('div')
      el.className = 'project-card-real'
      el.innerHTML = createPostHTML(post)
      postsGrid.appendChild(el)
    })
  })
  .catch(err => {
    console.error('Erreur Sanity:', err)
    postsGrid.innerHTML = `<p>Erreur lors du chargement des posts: ${err.message}</p>`
  })