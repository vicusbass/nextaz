import {defineType, defineField, defineArrayMember} from 'sanity'
import {BasketIcon} from '@sanity/icons'

export const shop = defineType({
  name: 'shop',
  title: 'Shop',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titlu pagina',
      type: 'string',
      initialValue: 'Shop',
    }),
    defineField({
      name: 'products',
      title: 'Produse',
      description: 'Drag and drop to reorder products',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'product'}],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Shop',
      }
    },
  },
})
