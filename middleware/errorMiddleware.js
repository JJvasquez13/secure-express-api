const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Handle specific errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: Object.values(err.errors).map((val) => val.message).join(', '),
        });
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(400).json({
            status: 'error',
            message: 'Duplicate key error: resource already exists',
        });
    }

    // Default error response
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
    });
};

module.exports = errorHandler;
