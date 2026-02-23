import groq from 'groq';

export const allProductSlugsQuery = groq`
  *[_type == "product" && defined(slug.current)]{
    "slug": slug.current,
    productType
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0]{
    _id,
    name,
    slug,
    productType,
    image,
    description,
    price
  }
`;
