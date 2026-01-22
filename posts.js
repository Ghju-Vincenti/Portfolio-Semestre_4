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
      <p><strong>Année :</strong>  ${post.year}</p>
      <p><strong>Tags:</strong> ${post.tag}</p>
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
  
  // Function to load categories, tags, and years from Sanity
  async function loadFilters() {
    try {
      // Fetch categories, tags, and years (adjust the queries to match your schema)
      const categories = await client.fetch('*[_type == "category"]{title}');
      const tags = await client.fetch('*[_type == "tag"]{title}');
      const years = await client.fetch('*[_type == "post"]{year}');
  
      console.log('Categories:', categories);
      console.log('Tags:', tags);
      console.log('Years:', years);
  
      // Populate the Category dropdown
      const categorySelect = document.getElementById('category');
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.title;
        option.textContent = category.title;
        categorySelect.appendChild(option);
      });
  
      // Populate the Tag dropdown
      const tagSelect = document.getElementById('tag');
      tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.title;
        option.textContent = tag.title;
        tagSelect.appendChild(option);
      });
  
      // Populate the Year dropdown (assuming you have unique years for posts)
      const yearSelect = document.getElementById('year');
      const uniqueYears = [...new Set(years.map(post => post.year))];
      uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  }
  
  // Function to build the query with dynamic filters
  function buildQuery(category, tag, year) {
    let query = `*[_type == "post"`;
  
    const filters = [];
  
    // Add filters to the query if they exist
    if (category) {
      filters.push(`references(*[_type == "category" && title == $category]._id)`);
    }
  
    if (tag) {
      filters.push(`references(*[_type == "tag" && title == $tag]._id)`);
    }
  
    if (year) {
      filters.push(`year == $year`);
    }
  
    // Combine filters if they exist
    if (filters.length > 0) {
      query += ` && ${filters.join(' && ')}`;
    }
  
    query += `] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      "imageUrl": mainImage.asset->url,
      publishedAt,
      body,
      "categories": categories[]->{title},
      year,
      tag,
      "author": author->name,
      "documents": documents[] {
        "asset": asset->{url, originalFilename}
      }
    }`;
  
    return query;
  }
  
  // Function to display the posts in the HTML
  function displayPosts(posts) {
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = ''; // Clear previous posts
  
    if (posts.length === 0) {
      postsList.innerHTML = '<p>No posts found.</p>';
      return;
    }
  
    posts.forEach(post => {
      const excerpt = post.body ? post.body : 'No excerpt available';
      const fullContent = post.body ? post.body : 'No content available';
  
      const postElement = document.createElement('div');
      postElement.classList.add('project-card-real');
  
      postElement.innerHTML = `
        <div class="post-header">
          <h2>${post.title || 'Titre non disponible'}</h2>
          ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">` : ''}
        </div>
  
        <div class="post-meta">
          <p><strong>Auteur :</strong> ${post.author || 'Inconnu'}</p>
          <p><strong>Année :</strong> ${post.year || 'Non spécifiée'}</p>
          <p><strong>Tags:</strong> ${post.tags?.length ? post.tags.join(', ') : 'Aucun'}</p>
          <p><strong>Catégories :</strong> ${post.categories?.length ? post.categories.map(cat => cat.title).join(', ') : 'Aucune'}</p>
        </div>
  
        <div class="post-excerpt">
          <p><strong>Résumé :</strong> ${excerpt}</p>
        </div>
  
        <div class="post-content" style="display: none;">
          <h3>Contenu complet :</h3>
          <p>${fullContent}</p>
        </div>
  
        <button class="toggle-content cta" onclick="toggleContent(this)">
          Lire la suite
        </button>
  
        ${post.documents?.length ? `
          <div class="post-documents">
            <p><strong>Fichiers :</strong></p>
            <ul style="list-style: none; padding: 0;">
              ${post.documents.map(doc => 
                `<li style="margin: 5px 0;">
                  <a href="${doc.asset?.url}" class="cta" target="_blank" rel="noopener" style="text-decoration: none;">
                    ${doc.asset?.originalFilename || 'Fichier'}
                  </a>
                </li>`
              ).join('')}
            </ul>
          </div>
        ` : ''}
      `;
  
      postsList.appendChild(postElement);
    });
  }
  
  
  // Handle form submission and filtering
  document.getElementById('filterForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    // Get selected filter values
    const category = document.getElementById('category').value;
    const tag = document.getElementById('tag').value;
    const year = document.getElementById('year').value;
  
    const query = buildQuery(category, tag, year);
    const posts = await client.fetch(query, { category, tag, year });
  
    // Display the filtered posts
    displayPosts(posts);
  });
  
  // Call the loadFilters function when the page loads
  document.addEventListener('DOMContentLoaded', function () {
    loadFilters();
  });
  