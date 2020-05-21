const faker = require("faker");

const createProduct = () => ({
  name: faker.commerce.productName(),
  slogan: faker.company.catchPhrase(),
  description: faker.lorem.paragraph(),
  category: faker.commerce.department(),
  default_price: faker.commerce.price(),
});

const createStyle = () => ({
  name: faker.commerce.productAdjective(),
  original_price: faker.commerce.price(),
  sale_price: faker.commerce.price(),
  default$1: Math.round(Math.random()),
});

const createPhotos = () => ({
  thumbnail_url: faker.image.avatar(),
  url: faker.image.fashion(),
});

const createSku = () => {
  // Random int btw 5 and 10
  numSkuFields = Math.floor(Math.random() * 5) + 5;
  let json = "{";
  for (let i = 0; i < numSkuFields; i++) {
    json += `${skuOptions[Math.floor(Math.random() * 19) + 1]}: "${
      Math.floor(Math.random() * 8) + 1
    }",`;
  }
  return json + "}";
};

const skuOptions = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "6",
  "6.5",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "11.5",
  "12",
];

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  const fakeProducts = [];
  let fakeStyles = [];
  let fakePhotos = [];
  let fakeSkus = [];
  const desiredFakeProducts = 20;

  for (let i = 0; i < desiredFakeProducts; i++) {
    fakeProducts.push(createProduct());
    let numStyles = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < numStyles; j++) {
      let fakeStyle = createStyle();
      fakeStyle.product_id = i;
      fakeStyle.id = j;
      fakeStyles.push(fakeStyle);
      let fakePhoto = createPhotos();
      fakePhoto.product_id = i;
      fakePhoto.style_id = j;
      fakePhotos.push(fakePhoto);
      let fakeSku = createSku();
      fakeSku.product_id = i;
      fakeSku.style_id = j;
      fakeSkus.push(fakeSku);
    }
  }
  console.log(fakeProducts);
  knex("product")
    .insert(fakeProducts)
    .then(() => {
      knex("styles").insert(fakeStyles);
    })
    .then(() => {
      return Promise.all([
        knex("photos").insert(fakePhotos),
        knex("skus").insert(fakeSkus),
      ]);
    })
    .catch((err) => console.log(err));
};
