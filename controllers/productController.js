const Product = require('../models/Product')
const Review = require('../models/Review')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/customError')

const getAllProducts = async (req, res) => {
    let products = await Product.find({}).lean()
    if(!products){
        throw new CustomError('Product not found.')
    }

    let reviews
    let productId
    for(let i = 0; i < products.length; i++){
        productId = products[i]._id
        reviews = await Review.find({ 'product': productId });
        products[i].reviews = reviews
        products[i].reviewCount = reviews.length
    }
    
    res.status(StatusCodes.OK).json( {productsCount: products.length, products} )
}

const getProduct = async (req, res ) => {
    const {
        params: {id: productId},
    } = req

    const product = await Product.findOne({_id: productId}).lean()
    if(!product){
        throw new CustomError('Product does not exist')
    }

    const reviews = await Review.find({ 'product': productId });
    product.reviewCount = reviews.length
    product.reviews = reviews
    res.status(StatusCodes.OK).json({product})
}

const updateProduct = async (req, res) => {
    const {
        params: {id: productId},
    } = req

    const product = await Product.findByIdAndUpdate(
        {_id: productId},
        req.body,
        {runValidators:true},
        {new: true}
    )

    if(!product){
        throw new CustomError('Product does not exist')
    }

    res.status(StatusCodes.OK).json({product})
}

const createProduct = async (req, res) => {
    const product = await Product.create(req.body)
    if(!product){
        throw new CustomError('Could not create product')
    }
    res.status(StatusCodes.CREATED).json( {product} )
}

const deleteProduct = async (req, res) => {
    const {
        params: {id: productId},
    } = req

    const product = await Product.findByIdAndDelete({_id:productId})

    if(!product){
        throw new CustomError('Product does not exist')
    }
    res.status(StatusCodes.OK).json( {msg: "Product successfully deleted"})
}


module.exports = {
    getProduct,
    updateProduct,
    createProduct,
    deleteProduct,
    getAllProducts
} 