import type {StructureResolver} from 'sanity/structure'
import {BasketIcon} from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Shop singleton
      S.listItem()
        .title('Shop')
        .icon(BasketIcon)
        .child(S.document().schemaType('shop').documentId('shop')),

      S.divider(),

      // Products list
      ...S.documentTypeListItems().filter(
        (listItem) => !['shop'].includes(listItem.getId() ?? '')
      ),
    ])
