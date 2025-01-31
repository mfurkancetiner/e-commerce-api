const Order = require('../models/Order')
const Product = require('../models/Product')
const Seller = require('../models/Seller')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/customError')

const getAllOrders = async(req, res) => {
    const orders = await Order.find({user:req.user.userId})
    if(!orders){
        throw new CustomError('Order not found.')
    }
    res.status(StatusCodes.OK).json( {ordersCount: orders.length, orders} )
}

const getOrder = async (req, res) => {
    const {
        params: {id: orderId},
    } = req

    const order = await Order.findOne({_id: orderId, user:req.user.userId})
    if(!order){
        throw new CustomError('Order does not exist')
    }
    res.status(StatusCodes.OK).json({order})
}

const updateOrder = async (req, res) => {
    const {
        params: {id: orderId},
    } = req

    const order = await Order.findOneAndUpdate(
        {_id: orderId, user:req.user.userId},
        req.body,
        {new: true}
    )
    if(!order){
        throw new CustomError('Order does not exist')
    }

    res.status(StatusCodes.OK).json({order})
}

const createOrder = async (req, res) => {

    const product = await Product.findOne({_id: req.body.product}).lean()
    if(!product){
        throw new CustomError('Product does not exist')
    }
    else if(product.inStock === 0){
        throw new CustomError('Order failed, no product in stock')
    } 

    const seller = await Seller.findOne({_id: product.seller}).lean()
    req.body.user = req.user.userId
    const order = await Order.create(req.body)

    product.hasSold = product.hasSold + 1
    product.inStock = product.inStock - 1
    seller.productsSold = seller.productsSold + 1

    await Product.updateOne({_id:product._id}, product)
    await Seller.updateOne({_id:seller._id}, seller)

    res.status(StatusCodes.CREATED).json( {order} )
}

const deleteOrder =  async(req, res) => {
    const {
        params: {id: orderId},
    } = req

    const order = await Order.deleteOne({_id:orderId, user: req.user.userId})
    if(order.deletedCount === 0){
        throw new CustomError('Order does not exist')
    }
    res.status(StatusCodes.OK).json( {msg: "Order successfully deleted"})

}

module.exports = {
    getAllOrders,
    getOrder,
    updateOrder,
    createOrder,
    deleteOrder
} 