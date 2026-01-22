// main.js
import { createClient } from 'https://cdn.skypack.dev/@sanity/client'

// Configuration adaptative selon l'environnement
const isProduction = window.location.protocol === 'https:' && window.location.hostname.includes('github.io')

const client = createClient({
  projectId: 'w1hfz6z1', 
  dataset: 'production',
  apiVersion: '2024-06-01',
  useCdn: true
})

// Debug info
console.log('Environment:', isProduction ? 'Production' : 'Development')
console.log('Using CDN:', isProduction)
console.log('Current URL:', window.location.href)

const query = `*[_type == "post"]{
  title,
  "slug": slug.current,
  "imageUrl": mainImage.asset->url,
  publishedAt,
  body,
  "categories": categories[]->{title},
  year,
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

// Fonction pour convertir blockContent en HTML
function blockContentToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks)) return 'Aucun contenu disponible.'
  
  return blocks.map(block => {
    if (block._type === 'block') {
      const style = block.style || 'normal'
      const children = block.children || []
      
      const text = children.map(child => {
        let content = child.text || ''
        
        // Gestion des styles (gras, italique, etc.)
        if (child.marks && child.marks.length > 0) {
          child.marks.forEach(mark => {
            switch(mark) {
              case 'strong':
                content = `<strong>${content}</strong>`
                break
              case 'em':
                content = `<em>${content}</em>`
                break
              case 'underline':
                content = `<u>${content}</u>`
                break
              case 'code':
                content = `<code>${content}</code>`
                break
            }
          })
        }
        
        return content
      }).join('')
      
      // Gestion des différents styles de bloc
      switch(style) {
        case 'h1':
          return `<h3>${text}</h3>` // h3 car h1 et h2 sont déjà utilisés
        case 'h2':
          return `<h4>${text}</h4>`
        case 'h3':
          return `<h5>${text}</h5>`
        case 'h4':
          return `<h6>${text}</h6>`
        case 'blockquote':
          return `<blockquote style="border-left: 3px solid #ccc; padding-left: 15px; margin: 10px 0; font-style: italic;">${text}</blockquote>`
        default:
          return text ? `<p>${text}</p>` : ''
      }
    }
    return ''
  }).join('')
}

// Fonction pour extraire un résumé du blockContent
function getExcerpt(blocks, maxLength = 200) {
  if (!blocks || !Array.isArray(blocks)) return 'Aucun résumé disponible.'
  
  let text = ''
  for (const block of blocks) {
    if (block._type === 'block' && block.children) {
      const blockText = block.children.map(child => child.text || '').join('')
      text += blockText + ' '
      if (text.length > maxLength) break
    }
  }
  
  return text.length > maxLength 
    ? text.substring(0, maxLength).trim() + '...' 
    : text.trim() || 'Aucun résumé disponible.'
}

// Fonction pour créer le HTML d'un post
function createPostHTML(post) {
  const excerpt = getExcerpt(post.body, 150)
  const fullContent = blockContentToHtml(post.body)
  
  const yearText = post.year ? post.year : 'Non précisée'

  return `
    <div class="post-header">
      <h2>${post.title || 'Titre non disponible'}</h2>
      ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">` : ''}
    </div>
    
    <div class="post-meta">
      <p><strong>Auteur :</strong> ${post.author || 'Inconnu'}</p>
      <p><strong>Année :</strong>  ${yearText}</p>
      <p><strong>Catégories :</strong> ${post.categories?.length ? post.categories.map(cat => cat.title).join(', ') : 'Aucune'}</p>
    </div>
    
    <div class="post-excerpt">
      <p><strong>Résumé :</strong> ${excerpt}</p>
    </div>
    
    <div class="post-content" style="display: none;">
      <h3>Contenu complet :</h3>
      ${fullContent}
    </div>
    
    <button class="toggle-content cta" onclick="toggleContent(this)">
      Lire la suite
    </button>
    
    ${post.documents?.length ? `
      <div class="post-documents">
        <p><strong>Fichiers :</strong></p>
        <ul style="list-style: none; padding: 0;">
          ${post.documents.map(doc => 
            `<li style="margin: 5px 0;"><a href="${doc.asset?.url}" class="cta" target="_blank" rel="noopener" style="text-decoration: none;">${doc.asset?.originalFilename || 'Fichier'}</a></li>`
          ).join('')}
        </ul>
      </div>` : ''
    }
  `
}

// Fonction pour basculer l'affichage du contenu complet
window.toggleContent = function(button) {
  const postCard = button.closest('.project-card-real')
  const excerpt = postCard.querySelector('.post-excerpt')
  const content = postCard.querySelector('.post-content')
  
  if (content.style.display === 'none') {
    excerpt.style.display = 'none'
    content.style.display = 'block'
    button.textContent = 'Réduire'
  } else {
    excerpt.style.display = 'block'
    content.style.display = 'none'
    button.textContent = 'Lire la suite'
  }
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