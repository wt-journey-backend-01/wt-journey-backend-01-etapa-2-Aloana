class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    res.status(500).json({ message: "Erro interno do servidor" });
}

module.exports = {
    AppError,
    errorHandler
};