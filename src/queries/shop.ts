import groq from 'groq';

export const shopQuery = groq`
  *[_type == "shop" && _id == "shop"][0]{
    title,
    products[]->{
      _id,
      name,
      slug,
      productType,
      image,
      description,
      price
    }
  }
`;
