const Products = require('../models/product')

const getProducts = async (req, res) => {
    try {
        const products = await Products.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        res.status(200).json(product);
        return product;
    } catch (error) {
        res.status(500).json(error);
    }
}

const createProduct = async (req, res) => {
    try {
        const newProduct = new Products({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            image: req.body.image,
            discount: req.body.discount,
        });

        await newProduct.save();
        const referer = req.get('referer') || '/';
        res.redirect(referer);
    } catch (error) {
        console.error(error);
        const referer = req.get('referer') || '/';
        res.redirect(referer);
    }
}


const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Products.updateOne(
            { _id: productId },
            { 
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    category: req.body.category,
                    price: req.body.price,
                    image: req.body.image,
                    discount: req.body.discount,
                }
            }
        );
        if (product.matchedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const referer = req.get('referer') || '/';
        res.redirect(referer);
        
    } catch (error) {
        console.error(error);
        const referer = req.get('referer') || '/';
        res.redirect(referer);
    }
}



const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Products.deleteOne({ _id: productId });

        if (product.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const referer = req.get('referer') || '/';
        res.redirect(referer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};