const faker = require("faker");
const _ = require("underscore");

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
  default: Math.round(Math.random()),
});

const createPhotos = () => ({
  thumbnail_url: faker.image.avatar(),
  url: faker.image.fashion(),
});

const createSku = () => {
  // Random int btw 5 and 10
  numSkuFields = Math.floor(Math.random() * 5) + 5;
  // let sku = "{";
  let sku = {};
  for (let i = 0; i < numSkuFields; i++) {
    // sku += `"${skuOptions[Math.floor(Math.random() * 19)]}": "${
    //   Math.floor(Math.random() * 8) + 1
    // }",`;
    sku[skuOptions[Math.floor(Math.random() * 19)]] = String(
      Math.floor(Math.random() * 8) + 1
    );
  }
  // json = json.slice(0, json.length - 1);
  // return json + "}";
  sku = JSON.stringify(sku);
  return sku;
};

const skuOptions = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  6,
  6.5,
  7,
  7.5,
  8,
  8.5,
  9,
  9.5,
  10,
  10.5,
  11,
  11.5,
  12,
];

exports.seed = async function (knex) {
  let fakeProducts = [];
  let fakeStyles = [];
  let fakePhotos = [];
  let fakeSkus = [];
  const desiredFakeProducts = 10000000;

  for (let i = 1; i <= desiredFakeProducts; i++) {
    fakeProducts.push(createProduct());
    if (i % 50000 === 0) {
      // console.log(fakeProducts);
      await knex("products").insert(fakeProducts);
      fakeProducts = [];
    }

    let numStyles = Math.floor(Math.random() * 5) + 1;
    for (let j = 1; j <= numStyles; j++) {
      // Add a fake style
      let fakeStyle = {
        product_id: i,
      };
      _.extend(fakeStyle, createStyle());
      fakeStyles.push(fakeStyle);
      fakePhotos.push(createPhotos());
      fakeSkus.push({ skus: createSku() });
      if (i % 50000 === 0) {
        await knex.batchInsert("styles", fakeStyles, 1000);
        fakeStyles = [];
        await Promise.all([
          knex.batchInsert("photos", fakePhotos, 1000),
          knex.batchInsert("skus", fakeSkus, 1000),
        ]);
        fakePhotos = [];
        fakeSkus = [];
        console.log(String((i / desiredFakeProducts) * 100) + "% done");
      }

      // Add fake photos

      // Add fake SKUs
    }
  }

  // console.log(fakeProducts);
  // console.log(fakeSkus);

  // return Promise.all([
  //   knex.batchInsert,
  //   ("photos", fakePhotos, 10000000),
  //   knex.batchInsert("skus", fakeSkus, 10000000),
  // ]).catch((err) => console.log(err));
};
