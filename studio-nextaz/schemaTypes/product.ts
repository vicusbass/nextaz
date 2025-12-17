import {defineType, defineField} from 'sanity'
import {BottleIcon} from '@sanity/icons'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: BottleIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nume',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'productType',
      title: 'Tip produs',
      type: 'string',
      options: {
        list: [
          {title: 'Single', value: 'single'},
          {title: 'Package', value: 'package'},
          {title: 'Bundle', value: 'bundle'},
        ],
        layout: 'radio',
      },
      initialValue: 'single',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descriere',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'price',
      title: 'Pret',
      type: 'number',
      description: 'Price in LEI (e.g. 40.00)',
      validation: (rule) =>
        rule
          .required()
          .positive()
          .precision(2),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'productType',
      media: 'image',
      price: 'price',
    },
    prepare({title, subtitle, media, price}) {
      return {
        title,
        subtitle: `${subtitle} - ${price?.toFixed(2) || '0.00'} LEI`,
        media,
      }
    },
  },
})
