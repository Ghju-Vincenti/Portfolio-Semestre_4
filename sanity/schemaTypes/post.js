import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Images modales',
      of: [
        {
          type: 'image',
          options: { hotspot: true }
        }
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    }),    
    defineField({
      name: 'year',
      title: 'Année',
      type: 'string',
      of: [{type: 'reference', to: {type: 'year'}}],
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tag' }]  // Reference to the 'tag' document
        }
      ],
      options: {
        layout: 'tags', // This makes the tag field display nicely in Sanity Studio
      }
    }),
    defineField({
      name: 'documents',
      title: 'Fichiers associés',
      type: 'array',
      of: [
        {
          type: 'file',
          options: {
            accept: '.pdf,.docx,.pptx,.zip,.jpg,.png,.MP4',
          }
        }
      ]
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },

})


