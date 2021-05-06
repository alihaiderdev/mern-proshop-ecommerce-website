import asyncHandler from 'express-async-handler'; // we use this middleware just because we dontwant to use in every route try catch block for error handling
import Product from '../models/productModel.js';

// @desc     Fetch all products
// @route    GET /api/products
// @access   Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 2;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        // here we search products by their name thats why we write name here
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  // const count = await Product.count({ ...keyword });
  const count = await Product.countDocuments({ ...keyword });
  // const products = await Product.find({}); // .find({}) use for find everything
  // const products = await Product.find({ ...keyword });
  // const products = await Product.find({ ...keyword }).limit(pageSize);
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  // res.status(401); //we use this error code for not authorized
  // throw new Error('Not Authorized');

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc     Fetch single product
// @route    GET /api/products/:id
// @access   Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    // status 500 default
    // res.status(404).json({ message: 'Product not Found' });
    res.status(404); // optional

    // here we can do this just because of error middleware
    throw new Error('Product Not Found');
  }
});

// @desc     Delete a product by id
// @route    DELETE /api/products/:id
// @access   Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if you want to edit / delete only the owner and creator of product then we simply use this check
  // if (req.user._id === product.user.id) {
  //   // only the creator of that product can update or delete it
  // }

  if (product) {
    await product.remove();
    res.json({ message: 'Product Removed Successfully' });
  } else {
    res.status(404);
    throw new Error('Product Not Found');
  }
});

// @desc     Create a product
// @route    POST /api/products
// @access   Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Samaple name',
    user: req.user._id,
    image: '/images/sample.png',
    brand: 'Sample brand',
    category: 'Sample category',
    description: 'Sample description',
    price: 0.0,
    countInStock: 0,
    numReviews: 0,
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc     Create new review
// @route    PUT /api/products/:id/reviews
// @access   Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }
    const review = { name: req.user.name, rating: Number(rating), comment, user: req.user._id };
    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product Not Found');
  }
});

// @desc     Get top rated products
// @route    PUT /api/products/top
// @access   Public
const getTopProducts = asyncHandler(async (req, res) => {
  // here sorting in ascending order we use -1
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// @desc     Create new review
// @route    POST /api/products/:id/reviews
// @access   Private
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;
  const product = await Product.findById(req.params.id);
  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product Not Found');
  }
});

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
};