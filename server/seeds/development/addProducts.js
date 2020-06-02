const faker = require("faker");
const _ = require("underscore");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { PerformanceObserver, performance } = require("perf_hooks");
const productsFile = path.join(__dirname, "products.json");
const stylesFile = path.join(__dirname, "styles.json");
const photosFile = path.join(__dirname, "photos.json");
const skusFile = path.join(__dirname, "skus.json");

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
  const wrapped = performance.timerify(generateProducts);

  wrapped();

  const observes = new PerformanceObserver((list) => {
    console.log(list.getEntries()[0].duration);
    observes.disconnect();
  });
  observes.observe({ entryTypes: ["function"] });
};

const generateProducts = () => {
  let fakeProducts = [];
  let fakeStyles = [];
  let fakePhotos = [];
  let fakeSkus = [];
  const desiredFakeProducts = 10000000;

  for (let i = 1; i <= desiredFakeProducts; i++) {
    fakeProducts.push(createProduct());

    if (i % 10000 === 0) {
      console.log(String((i / desiredFakeProducts) * 100) + "% done");
      fakeProducts.forEach((product) => {
        fs.writeFileSync(productsFile, JSON.stringify(product), {
          flag: "as",
        });
      });
      console.log(String((i / desiredFakeProducts) * 100) + "% done");
      fakeProducts = [];
    }

    let numStyles = Math.floor(Math.random() * 5) + 1;
    for (let j = 1; j <= numStyles; j++) {
      // Add a fake style
      let fakeStyle = {
        product_id: i,
      };
      _.extend(fakeStyle, createStyle());
      // fakeStyles.push(fakeStyle);
      fakeStyles.push(fakeStyle);
      fakePhotos.push(createPhotos());
      fakeSkus.push({ sku: createSku() });

      if (i % 10000 === 0) {
        fakeStyles.forEach((style) => {
          fs.writeFileSync(stylesFile, JSON.stringify(style), {
            flag: "as",
          });
        });
        console.log(String((i / desiredFakeProducts) * 100) + "% done");
        fakeStyles = [];
      }

      if (i % 10000 === 0) {
        fakePhotos.forEach((photo) => {
          fs.writeFileSync(photosFile, JSON.stringify(photo), {
            flag: "as",
          });
        });
        fakePhotos = [];
        console.log(String((i / desiredFakeProducts) * 100) + "% done");
      }

      if (i % 10000 === 0) {
        fakeSkus.forEach((sku) => {
          fs.writeFileSync(skusFile, JSON.stringify(sku), {
            flag: "as",
          });
        });
        fakeSkus = [];
        console.log(String((i / desiredFakeProducts) * 100) + "% done");
      }
      // fakePhotos.push(createPhotos());
      // fakeSkus.push({ skus: createSku() });
      // if (i % 5000 === 0) {
      //   await knex.batchInsert("styles", fakeStyles, 1000);
      //   fakeStyles = [];
      //   await Promise.all([
      //     knex.batchInsert("photos", fakePhotos, 1000),
      //     knex.batchInsert("skus", fakeSkus, 1000),
      //   ]);
      //   fakePhotos = [];
      //   fakeSkus = [];
    }
  }

  // Add fake photos

  // Add fake SKUs
};

// console.log(fakeProducts);
// console.log(fakeSkus);

// return Promise.all([
//   knex.batchInsert,
//   ("photos", fakePhotos, 10000000),
//   knex.batchInsert("skus", fakeSkus, 10000000),
// ]).catch((err) => console.log(err));
// };
